# Web3 Integration Plan - "Eat Your Own Dog Food"

## Vision

Publish World Papers articles simultaneously to:
1. **Traditional Web** (worldpapers.com)
2. **IPFS** (Decentralized storage)
3. **On-chain** (Proof of authorship)
4. **ENS-linked** (yourname.eth → article archive)

Make World Papers a showcase for Web3 publishing best practices.

---

## Phase 1: ENS Integration (Quick Win - 2-3 hours)

### What is ENS?
Ethereum Name Service - think DNS for Web3. `yourname.eth` instead of `0x742d35Cc...`

### Implementation

#### 1.1 Display ENS Names
```typescript
// lib/web3/ens.ts
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export async function resolveENS(address: string): Promise<string | null> {
  try {
    const ensName = await client.getEnsName({ address });
    return ensName;
  } catch {
    return null;
  }
}

export async function resolveAddress(ensName: string): Promise<string | null> {
  try {
    const address = await client.getEnsAddress({ name: ensName });
    return address;
  } catch {
    return null;
  }
}

export async function getENSAvatar(ensName: string): Promise<string | null> {
  try {
    const avatar = await client.getEnsAvatar({ name: ensName });
    return avatar;
  } catch {
    return null;
  }
}
```

#### 1.2 Update Author Schema
```sql
-- Add ENS fields to authors table
ALTER TABLE authors ADD COLUMN ens_name TEXT UNIQUE;
ALTER TABLE authors ADD COLUMN eth_address TEXT UNIQUE;
ALTER TABLE authors ADD COLUMN ens_avatar_url TEXT;

-- Update articles to link ENS
ALTER TABLE articles ADD COLUMN author_ens TEXT;
```

#### 1.3 Author Profile with ENS
```typescript
// components/AuthorProfile.tsx
export function AuthorProfile({ author }) {
  return (
    <div className="flex items-center gap-3">
      {author.ens_avatar_url ? (
        <img src={author.ens_avatar_url} className="w-10 h-10 rounded-full" />
      ) : (
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full" />
      )}
      <div>
        <p className="font-medium">{author.name}</p>
        {author.ens_name && (
          <p className="text-sm text-purple-600">{author.ens_name}</p>
        )}
      </div>
    </div>
  );
}
```

#### Dependencies
```json
{
  "dependencies": {
    "viem": "^2.7.0"
  }
}
```

---

## Phase 2: IPFS Publishing (4-5 hours)

### What is IPFS?
InterPlanetary File System - decentralized file storage. Content-addressed (hash-based URLs).

### Implementation

#### 2.1 IPFS Upload Service
```typescript
// lib/web3/ipfs.ts
import { create } from 'ipfs-http-client';

// Use Pinata (free tier: 1GB)
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET = process.env.PINATA_SECRET;

export async function uploadToIPFS(content: string, metadata: {
  title: string;
  author: string;
  publishedAt: string;
}): Promise<string> {
  const formData = new FormData();

  // Create article JSON
  const article = {
    title: metadata.title,
    author: metadata.author,
    content: content,
    published: metadata.publishedAt,
    timestamp: Date.now(),
  };

  formData.append('file', new Blob([JSON.stringify(article)]), 'article.json');
  formData.append('pinataMetadata', JSON.stringify({
    name: metadata.title,
    keyvalues: {
      author: metadata.author,
      type: 'article',
    }
  }));

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: PINATA_API_KEY!,
      pinata_secret_api_key: PINATA_SECRET!,
    },
    body: formData,
  });

  const data = await response.json();
  return data.IpfsHash; // Returns CID (Content Identifier)
}

export function getIPFSUrl(cid: string): string {
  return `https://ipfs.io/ipfs/${cid}`;
}

export function getPinataUrl(cid: string): string {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
}
```

#### 2.2 Update Article Schema
```sql
ALTER TABLE articles ADD COLUMN ipfs_cid TEXT;
ALTER TABLE articles ADD COLUMN ipfs_url TEXT;
ALTER TABLE articles ADD COLUMN web3_published_at TIMESTAMPTZ;
```

#### 2.3 Publish to IPFS Button
```typescript
// In article editor
const publishToIPFS = async () => {
  const cid = await uploadToIPFS(formData.content, {
    title: formData.title,
    author: 'yourname.eth',
    publishedAt: new Date().toISOString(),
  });

  // Save CID to database
  await fetch('/api/admin/articles/web3', {
    method: 'POST',
    body: JSON.stringify({
      articleId: article.id,
      ipfs_cid: cid,
      ipfs_url: getIPFSUrl(cid),
    }),
  });

  alert(`Published to IPFS: ${getIPFSUrl(cid)}`);
};
```

#### Dependencies
```json
{
  "dependencies": {
    "ipfs-http-client": "^60.0.1"
  }
}
```

---

## Phase 3: On-chain Proof (3-4 hours)

### What is On-chain Proof?
Store article hash on blockchain for immutable proof of authorship and timestamp.

### Implementation (Using Optimism - cheap gas)

#### 3.1 Smart Contract (Solidity)
```solidity
// contracts/ArticleRegistry.sol
pragma solidity ^0.8.0;

contract ArticleRegistry {
    struct Article {
        bytes32 contentHash;
        string ipfsCid;
        address author;
        uint256 timestamp;
    }

    mapping(bytes32 => Article) public articles;
    mapping(address => bytes32[]) public authorArticles;

    event ArticlePublished(
        bytes32 indexed contentHash,
        string ipfsCid,
        address indexed author,
        uint256 timestamp
    );

    function publishArticle(bytes32 _contentHash, string memory _ipfsCid) public {
        require(articles[_contentHash].timestamp == 0, "Already published");

        articles[_contentHash] = Article({
            contentHash: _contentHash,
            ipfsCid: _ipfsCid,
            author: msg.sender,
            timestamp: block.timestamp
        });

        authorArticles[msg.sender].push(_contentHash);

        emit ArticlePublished(_contentHash, _ipfsCid, msg.sender, block.timestamp);
    }

    function getArticle(bytes32 _contentHash) public view returns (Article memory) {
        return articles[_contentHash];
    }

    function getAuthorArticles(address _author) public view returns (bytes32[] memory) {
        return authorArticles[_author];
    }
}
```

#### 3.2 Web3 Publishing Flow
```typescript
// lib/web3/publish.ts
import { createWalletClient, custom, keccak256, toHex } from 'viem';
import { optimism } from 'viem/chains';

const CONTRACT_ADDRESS = '0x...'; // Deployed contract

export async function publishToChain(
  content: string,
  ipfsCid: string
): Promise<string> {
  // Connect wallet (MetaMask)
  const client = createWalletClient({
    chain: optimism,
    transport: custom(window.ethereum),
  });

  const [address] = await client.requestAddresses();

  // Hash content
  const contentHash = keccak256(toHex(content));

  // Call contract
  const hash = await client.writeContract({
    address: CONTRACT_ADDRESS,
    abi: ARTICLE_REGISTRY_ABI,
    functionName: 'publishArticle',
    args: [contentHash, ipfsCid],
    account: address,
  });

  return hash; // Transaction hash
}
```

#### 3.3 Verify Authenticity
```typescript
// Anyone can verify an article
export async function verifyArticle(content: string): Promise<{
  isAuthentic: boolean;
  author: string;
  timestamp: number;
}> {
  const contentHash = keccak256(toHex(content));

  const article = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ARTICLE_REGISTRY_ABI,
    functionName: 'getArticle',
    args: [contentHash],
  });

  return {
    isAuthentic: article.timestamp > 0,
    author: article.author,
    timestamp: article.timestamp,
  };
}
```

---

## Phase 4: NFT Minting (Optional - 4-5 hours)

### Turn Articles into Collectibles

#### 4.1 ERC-721 Contract
```solidity
// contracts/ArticleNFT.sol
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ArticleNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct ArticleMetadata {
        string title;
        string ipfsCid;
        uint256 publishedAt;
    }

    mapping(uint256 => ArticleMetadata) public articles;

    constructor() ERC721("World Papers Article", "WPA") {}

    function mintArticle(
        address author,
        string memory title,
        string memory ipfsCid
    ) public returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        _mint(author, newTokenId);

        articles[newTokenId] = ArticleMetadata({
            title: title,
            ipfsCid: ipfsCid,
            publishedAt: block.timestamp
        });

        return newTokenId;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Return IPFS metadata URL
        return string(abi.encodePacked("ipfs://", articles[tokenId].ipfsCid));
    }
}
```

#### 4.2 Mint Button in Editor
```typescript
const mintAsNFT = async () => {
  // First publish to IPFS
  const cid = await uploadToIPFS(formData.content, metadata);

  // Then mint NFT
  const tokenId = await mintArticleNFT(
    formData.title,
    cid,
    userAddress
  );

  alert(`Minted as NFT #${tokenId}! View on OpenSea`);
};
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  World Papers Article Editor                 │
│                                                               │
│  [Title] ────────────────────────────────────────────────    │
│  [Content] ──────────────────────────────────────────────    │
│                                                               │
│  Publishing Options:                                          │
│  ☑ Publish to worldpapers.com                                │
│  ☑ Publish to IPFS                                           │
│  ☑ Store hash on-chain (Optimism)                            │
│  ☐ Mint as NFT (optional)                                    │
│  ☐ Sign with ENS                                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
  ┌──────────┐      ┌──────────┐        ┌──────────┐
  │ Supabase │      │   IPFS   │        │ Optimism │
  │ Database │      │ (Pinata) │        │   L2     │
  └──────────┘      └──────────┘        └──────────┘
        │                   │                   │
        │                   │                   │
        ▼                   ▼                   ▼
   Regular URL         ipfs://Qm...       0x...hash
   worldpapers.com     (permanent)      (proof)
```

---

## User Flow

### Publishing an Article (Web3 Mode)

1. **Write Article** in editor
2. **Click "Publish to Web3"**
   - Connect MetaMask wallet
   - Confirm ENS identity (yourname.eth)
3. **Backend Process:**
   - Upload content to IPFS → Get CID
   - Store hash on Optimism → Get tx hash
   - Save to Supabase with both URLs
4. **Article Now Has:**
   - Regular URL: `worldpapers.com/articles/my-post`
   - IPFS URL: `ipfs.io/ipfs/QmXxxx...`
   - On-chain proof: `optimistic.etherscan.io/tx/0x...`
   - Author ENS: `yourname.eth`

### Reading an Article (Decentralized)

- Anyone can verify authenticity by comparing content hash
- IPFS ensures article can never be taken down
- On-chain timestamp proves when it was published
- ENS links to author's identity

---

## Cost Estimate

### Gas Fees (Optimism)
- Publish article hash: ~$0.01-0.05
- Mint NFT: ~$0.10-0.50

### IPFS Storage (Pinata Free Tier)
- 1GB storage free
- 100GB bandwidth/month free
- Upgrade: $20/month for unlimited

### Total: ~$0.01-0.05 per article ✨

---

## Implementation Timeline

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| **Phase 1** | ENS name resolution | 2-3h | HIGH |
| **Phase 1** | ENS avatar display | 1h | HIGH |
| **Phase 2** | IPFS upload integration | 3h | HIGH |
| **Phase 2** | Pinata API setup | 1h | HIGH |
| **Phase 3** | Smart contract deployment | 2h | MEDIUM |
| **Phase 3** | On-chain publishing flow | 2h | MEDIUM |
| **Phase 4** | NFT contract (optional) | 3h | LOW |
| **Phase 4** | OpenSea integration | 2h | LOW |
| **Total** | | **16-20h** | Across 3-4 sessions |

---

## Quick Start Guide

### 1. Get Your ENS Name
1. Visit [app.ens.domains](https://app.ens.domains)
2. Search for `yourname.eth`
3. Register for ~$5/year (on Ethereum mainnet)

### 2. Set Up Pinata
1. Visit [pinata.cloud](https://pinata.cloud)
2. Sign up (free tier)
3. Get API keys
4. Add to `.env.local`:
```bash
PINATA_API_KEY=your_key
PINATA_SECRET=your_secret
```

### 3. Deploy Smart Contract
```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Deploy to Optimism testnet
npx hardhat run scripts/deploy.ts --network optimism-testnet
```

### 4. Enable in Editor
```typescript
// In article editor, add checkbox:
<input
  type="checkbox"
  checked={publishToWeb3}
  onChange={(e) => setPublishToWeb3(e.target.checked)}
/>
Publish to Web3 (IPFS + On-chain)
```

---

## Benefits of Web3 Publishing

### For You (Author)
- ✅ **Permanent Archive**: IPFS ensures content survives forever
- ✅ **Proof of Authorship**: On-chain timestamp proves you wrote it first
- ✅ **Censorship Resistant**: No platform can take down your articles
- ✅ **Own Your Identity**: ENS name is portable across Web3

### For Readers
- ✅ **Verify Authenticity**: Check on-chain if article is authentic
- ✅ **Access Anywhere**: IPFS mirrors ensure global availability
- ✅ **Support Authors**: Buy article NFTs to support directly

### For World Papers
- ✅ **Credibility**: Shows commitment to decentralization
- ✅ **Future-Proof**: Content outlives any single server
- ✅ **Innovation**: First mover in Web3 policy journalism
- ✅ **Eat Your Own Dog Food**: Practice what you preach about Web3

---

## Next Steps

1. **Test Current Editor**: Make sure basic publishing works
2. **Get ENS Name**: Register yourname.eth
3. **Phase 1**: Add ENS integration (quick win!)
4. **Phase 2**: IPFS publishing (core feature)
5. **Phase 3**: On-chain proof (credibility boost)
6. **Phase 4**: NFT minting (optional monetization)

Ready to become a Web3-native publisher? 🚀

---

**Document Version**: 1.0
**Last Updated**: 2025-10-31
**Owner**: World Papers Team
**Status**: Ready for Implementation
