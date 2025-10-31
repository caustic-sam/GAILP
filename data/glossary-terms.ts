/**
 * Digital Policy & Identity Glossary Terms
 *
 * Source: DeFi Glossary + Digital Identity Standards
 * Used for "Term of the Day" feature
 */

export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms?: string[];
  source?: string;
}

export const glossaryTerms: GlossaryTerm[] = [
  // Digital Identity & Authentication
  {
    term: "Decentralized Identity (DID)",
    definition: "A portable, user-controlled identity that doesn't rely on a centralized registry, identity provider, or certificate authority. DIDs enable verifiable, self-sovereign digital identities.",
    category: "Digital Identity",
    relatedTerms: ["Self-Sovereign Identity", "Verifiable Credentials", "Web3"],
    source: "W3C DID Specification"
  },
  {
    term: "Zero-Knowledge Proof (ZKP)",
    definition: "A cryptographic method where one party can prove to another that a statement is true without revealing any information beyond the validity of the statement itself.",
    category: "Cryptography",
    relatedTerms: ["Privacy-Preserving", "Blockchain", "Authentication"],
    source: "NIST"
  },
  {
    term: "Self-Sovereign Identity (SSI)",
    definition: "A model for managing digital identities where individuals or organizations have sole ownership and control of their digital and analog identities without relying on third-party service providers.",
    category: "Digital Identity",
    relatedTerms: ["Decentralized Identity", "Verifiable Credentials", "Identity Wallet"],
    source: "Decentralized Identity Foundation"
  },

  // Data Protection & Privacy
  {
    term: "Data Minimization",
    definition: "The principle that personal data collected and processed should be limited to what is directly relevant and necessary to accomplish a specified purpose.",
    category: "Privacy",
    relatedTerms: ["GDPR", "Privacy by Design", "Purpose Limitation"],
    source: "GDPR Article 5"
  },
  {
    term: "Privacy by Design",
    definition: "An approach to systems engineering which takes privacy into account throughout the whole engineering process, embedding privacy into the design and operation of IT systems and business practices.",
    category: "Privacy",
    relatedTerms: ["Data Protection", "GDPR", "Privacy-Enhancing Technologies"],
    source: "Ann Cavoukian"
  },
  {
    term: "Right to be Forgotten",
    definition: "Also known as the right to erasure, it enables individuals to request deletion or removal of personal data from Internet searches and other directories under specific circumstances.",
    category: "Privacy Rights",
    relatedTerms: ["GDPR", "Data Subject Rights", "Erasure"],
    source: "GDPR Article 17"
  },

  // Blockchain & Web3
  {
    term: "Smart Contract",
    definition: "Self-executing contracts with the terms directly written into code, automatically enforcing and executing the agreement when predetermined conditions are met.",
    category: "Blockchain",
    relatedTerms: ["Ethereum", "DeFi", "Web3", "Distributed Ledger"],
    source: "Ethereum Foundation"
  },
  {
    term: "Distributed Ledger Technology (DLT)",
    definition: "A consensus of replicated, shared, and synchronized digital data geographically spread across multiple sites, countries, or institutions without centralized data storage or administration.",
    category: "Blockchain",
    relatedTerms: ["Blockchain", "Consensus", "Immutability"],
    source: "ISO/TC 307"
  },
  // Cybersecurity
  {
    term: "Multi-Factor Authentication (MFA)",
    definition: "A security system that requires more than one method of authentication from independent categories of credentials to verify a user's identity for login or other transaction.",
    category: "Security",
    relatedTerms: ["Two-Factor Authentication", "Biometrics", "Authentication"],
    source: "NIST SP 800-63"
  },
  {
    term: "End-to-End Encryption (E2EE)",
    definition: "A system of communication where only the communicating users can read the messages, preventing third parties including service providers from accessing encryption keys needed to decrypt the conversation.",
    category: "Security",
    relatedTerms: ["Encryption", "Privacy", "Secure Communication"],
    source: "IETF"
  },
  {
    term: "Attack Surface",
    definition: "The total sum of vulnerabilities, pathways, or methods that can be exploited to carry out a security attack, including all points where an unauthorized user can try to enter or extract data.",
    category: "Security",
    relatedTerms: ["Vulnerability", "Threat Model", "Security Posture"],
    source: "NIST Cybersecurity Framework"
  },

  // Compliance & Regulation
  {
    term: "Data Protection Impact Assessment (DPIA)",
    definition: "A process designed to identify risks arising out of the processing of personal data and to minimize these risks as far and as early as possible, required for high-risk processing under GDPR.",
    category: "Compliance",
    relatedTerms: ["GDPR", "Risk Assessment", "Privacy"],
    source: "GDPR Article 35"
  },
  {
    term: "Data Controller",
    definition: "The natural or legal person, public authority, agency or other body which, alone or jointly with others, determines the purposes and means of the processing of personal data.",
    category: "Compliance",
    relatedTerms: ["GDPR", "Data Processor", "Data Protection"],
    source: "GDPR Article 4"
  },
  {
    term: "Lawful Basis",
    definition: "The legal justification required under GDPR for processing personal data, including consent, contract, legal obligation, vital interests, public task, or legitimate interests.",
    category: "Compliance",
    relatedTerms: ["GDPR", "Consent", "Data Processing"],
    source: "GDPR Article 6"
  },

  // AI & Emerging Tech
  {
    term: "Algorithmic Transparency",
    definition: "The principle that the factors that influence the decisions made by algorithms should be visible and understandable to the people affected by the algorithmic decisions.",
    category: "AI Ethics",
    relatedTerms: ["Explainable AI", "AI Governance", "Fairness"],
    source: "EU AI Act"
  },
  {
    term: "Differential Privacy",
    definition: "A system for publicly sharing information about a dataset by describing patterns within the data while withholding information about individuals in the dataset.",
    category: "Privacy Technology",
    relatedTerms: ["Data Anonymization", "Privacy-Preserving", "Statistical Disclosure"],
    source: "Apple & Google"
  },
  {
    term: "Federated Learning",
    definition: "A machine learning technique that trains algorithms across multiple decentralized devices or servers holding local data samples, without exchanging the raw data itself.",
    category: "AI Technology",
    relatedTerms: ["Privacy-Preserving ML", "Distributed Computing", "Edge Computing"],
    source: "Google Research"
  },

  // Standards & Frameworks
  {
    term: "OpenID Connect (OIDC)",
    definition: "An identity layer built on top of the OAuth 2.0 protocol that allows clients to verify the identity of end-users based on authentication performed by an authorization server.",
    category: "Standards",
    relatedTerms: ["OAuth", "Authentication", "Single Sign-On"],
    source: "OpenID Foundation"
  },
  {
    term: "FIDO2",
    definition: "A set of web authentication standards enabling password-less authentication through public key cryptography, biometrics, and security keys, developed by the FIDO Alliance and W3C.",
    category: "Standards",
    relatedTerms: ["WebAuthn", "Passwordless", "Biometric Authentication"],
    source: "FIDO Alliance"
  },
  {
    term: "ISO 27001",
    definition: "An international standard for information security management systems (ISMS) that specifies requirements for establishing, implementing, maintaining and continually improving information security.",
    category: "Standards",
    relatedTerms: ["Information Security", "ISMS", "Compliance"],
    source: "ISO/IEC"
  },

  // DeFi & Blockchain Terms
  {
    term: "Ethereum",
    definition: "A decentralized, open-source blockchain platform that enables smart contracts and decentralized applications (dApps) to be built and run without downtime, fraud, control, or interference from a third party.",
    category: "Blockchain",
    relatedTerms: ["Smart Contract", "dApp", "EVM", "Ether"],
    source: "Ethereum Foundation"
  },
  {
    term: "Gas Fee",
    definition: "The fee required to successfully conduct a transaction or execute a smart contract on the Ethereum blockchain, measured in Gwei and paid in Ether, compensating validators for the computational energy required.",
    category: "Blockchain",
    relatedTerms: ["Gas Limit", "Gas Price", "Gwei", "Transaction Cost"],
    source: "Ethereum Network"
  },
  {
    term: "DeFi (Decentralized Finance)",
    definition: "A blockchain-based form of finance that does not rely on central financial intermediaries such as brokerages, exchanges, or banks. Instead, it utilizes smart contracts on blockchains, primarily Ethereum.",
    category: "Blockchain",
    relatedTerms: ["Smart Contract", "Liquidity Pool", "Yield Farming", "DEX"],
    source: "DeFi Community"
  },
  {
    term: "DAO (Decentralized Autonomous Organization)",
    definition: "An organization represented by rules encoded as a computer program that is transparent, controlled by the organization members, and not influenced by a central government or entity.",
    category: "Blockchain",
    relatedTerms: ["Governance Token", "Smart Contract", "On-chain Governance"],
    source: "Ethereum Community"
  },
  {
    term: "ERC-20",
    definition: "A technical standard used for smart contracts on the Ethereum blockchain for implementing tokens. It defines a common list of rules that all Ethereum tokens must follow, enabling interoperability.",
    category: "Standards",
    relatedTerms: ["Token", "Smart Contract", "Ethereum", "ERC-721"],
    source: "Ethereum Improvement Proposal"
  },
  {
    term: "NFT (Non-Fungible Token)",
    definition: "A unique digital identifier recorded on a blockchain that certifies ownership and authenticity of a specific digital or physical asset. Based on the ERC-721 standard on Ethereum.",
    category: "Blockchain",
    relatedTerms: ["ERC-721", "Digital Asset", "Smart Contract", "Token"],
    source: "Ethereum ERC-721"
  },
  {
    term: "Ethereum Virtual Machine (EVM)",
    definition: "The runtime environment for smart contracts in Ethereum. It is a Turing-complete virtual machine that allows anyone to execute arbitrary code on the Ethereum network.",
    category: "Blockchain",
    relatedTerms: ["Smart Contract", "Solidity", "Gas", "State Machine"],
    source: "Ethereum Foundation"
  },
  {
    term: "Solidity",
    definition: "A statically-typed programming language designed for developing smart contracts that run on the Ethereum Virtual Machine (EVM). It is influenced by C++, Python, and JavaScript.",
    category: "Blockchain",
    relatedTerms: ["Smart Contract", "EVM", "Vyper", "dApp Development"],
    source: "Ethereum Foundation"
  },
  {
    term: "Consensus Mechanism",
    definition: "A fault-tolerant mechanism used in blockchain systems to achieve agreement on a single data value or state of the network among distributed processes or systems, such as Proof-of-Work or Proof-of-Stake.",
    category: "Blockchain",
    relatedTerms: ["Proof-of-Work", "Proof-of-Stake", "Validator", "Mining"],
    source: "Blockchain Technology"
  },
  {
    term: "Proof-of-Stake (PoS)",
    definition: "A consensus mechanism where validators are chosen to create new blocks based on the amount of cryptocurrency they hold and are willing to 'stake' as collateral, offering improved energy efficiency over Proof-of-Work.",
    category: "Blockchain",
    relatedTerms: ["Validator", "Staking", "Consensus", "Ethereum 2.0"],
    source: "Ethereum Foundation"
  },
  {
    term: "Liquidity Pool",
    definition: "A collection of funds locked in a smart contract used to facilitate decentralized trading, lending, and other functions in DeFi protocols. Users who provide liquidity earn fees from trades.",
    category: "Blockchain",
    relatedTerms: ["DeFi", "Liquidity Mining", "Yield Farming", "DEX"],
    source: "DeFi Protocols"
  },
  {
    term: "Yield Farming",
    definition: "The practice of staking or locking up cryptocurrencies in DeFi protocols to generate returns or rewards, typically in the form of additional cryptocurrency. Also known as liquidity mining.",
    category: "Blockchain",
    relatedTerms: ["DeFi", "Liquidity Pool", "Staking", "APY"],
    source: "DeFi Community"
  },
  {
    term: "Oracle",
    definition: "A third-party service that provides smart contracts with external information from outside the blockchain, enabling them to interact with real-world data such as price feeds, weather data, or event outcomes.",
    category: "Blockchain",
    relatedTerms: ["Smart Contract", "Chainlink", "Off-chain Data", "dApp"],
    source: "Blockchain Technology"
  },
  {
    term: "Stablecoin",
    definition: "A cryptocurrency designed to minimize price volatility by being pegged to a stable asset such as the US dollar, gold, or other cryptocurrencies. Examples include USDC, USDT, and DAI.",
    category: "Blockchain",
    relatedTerms: ["Cryptocurrency", "DeFi", "Pegged Asset", "Collateral"],
    source: "Crypto Industry"
  },
  {
    term: "Governance Token",
    definition: "A token that grants holders the right to vote on decisions that influence a protocol or DAO, such as parameter changes, treasury allocation, or protocol upgrades.",
    category: "Blockchain",
    relatedTerms: ["DAO", "On-chain Governance", "Voting Rights", "Token"],
    source: "DeFi Governance"
  },
  {
    term: "Merkle Tree",
    definition: "A data structure used in blockchain to efficiently and securely verify the integrity of large sets of data. Each leaf node represents a hash of data, and each non-leaf node is a hash of its children.",
    category: "Cryptography",
    relatedTerms: ["Hashing", "Data Integrity", "Blockchain", "Merkle Root"],
    source: "Computer Science"
  },
  {
    term: "HD Wallet (Hierarchical Deterministic Wallet)",
    definition: "A cryptocurrency wallet that generates all of its keys and addresses from a single master seed using a hierarchical tree structure, allowing for organized key management and easy backup via a mnemonic phrase.",
    category: "Digital Identity",
    relatedTerms: ["Mnemonic Phrase", "Private Key", "Wallet", "BIP-32"],
    source: "BIP-32 Standard"
  },
  {
    term: "KYC (Know Your Customer)",
    definition: "The process of verifying the identity of clients by financial institutions and regulated companies to prevent fraud, money laundering, and terrorist financing. Increasingly applied in cryptocurrency exchanges.",
    category: "Compliance",
    relatedTerms: ["AML", "Identity Verification", "Regulation", "Compliance"],
    source: "Financial Regulation"
  },
  {
    term: "AML (Anti-Money Laundering)",
    definition: "A set of laws, regulations, and procedures intended to prevent criminals from disguising illegally obtained funds as legitimate income. Applied to traditional finance and increasingly to cryptocurrency.",
    category: "Compliance",
    relatedTerms: ["KYC", "Financial Crime", "Regulation", "Compliance"],
    source: "Financial Regulation"
  },
  {
    term: "Mnemonic Phrase (Seed Phrase)",
    definition: "A list of words (typically 12 or 24) that store all the information needed to recover a cryptocurrency wallet. It serves as a human-readable backup of the wallet's private keys.",
    category: "Digital Identity",
    relatedTerms: ["HD Wallet", "Private Key", "Wallet Recovery", "BIP-39"],
    source: "BIP-39 Standard"
  }
];

/**
 * Get a term for a specific date (deterministic rotation)
 */
export function getTermOfDay(date: Date = new Date()): GlossaryTerm {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000);
  const index = dayOfYear % glossaryTerms.length;
  return glossaryTerms[index];
}

/**
 * Get a random term
 */
export function getRandomTerm(): GlossaryTerm {
  return glossaryTerms[Math.floor(Math.random() * glossaryTerms.length)];
}

/**
 * Search terms by keyword
 */
export function searchTerms(query: string): GlossaryTerm[] {
  const lowerQuery = query.toLowerCase();
  return glossaryTerms.filter(term =>
    term.term.toLowerCase().includes(lowerQuery) ||
    term.definition.toLowerCase().includes(lowerQuery) ||
    term.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get terms by category
 */
export function getTermsByCategory(category: string): GlossaryTerm[] {
  return glossaryTerms.filter(term => term.category === category);
}

/**
 * Get all unique categories
 */
export function getCategories(): string[] {
  return Array.from(new Set(glossaryTerms.map(term => term.category)));
}
