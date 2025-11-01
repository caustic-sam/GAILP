export {};

declare global {
  namespace jest {
    interface MockInstance<T = any, Y extends any[] = any[]> {
      (...args: Y): T;
      mock: {
        calls: Y[];
        results: Array<{ type: string; value: unknown }>;
        instances: unknown[];
        clear(): void;
        reset(): void;
        restore(): void;
      };
      mockImplementation(fn: (...args: Y) => T): MockInstance<T, Y>;
      mockImplementationOnce(fn: (...args: Y) => T): MockInstance<T, Y>;
      mockReturnValue(value: T): MockInstance<T, Y>;
      mockReturnValueOnce(value: T): MockInstance<T, Y>;
      mockResolvedValue(value: T extends Promise<unknown> ? T : Promise<T>): MockInstance<Promise<T>, Y>;
      mockResolvedValueOnce(value: T extends Promise<unknown> ? T : Promise<T>): MockInstance<Promise<T>, Y>;
      mockRejectedValue(value: unknown): MockInstance<Promise<never>, Y>;
      mockRejectedValueOnce(value: unknown): MockInstance<Promise<never>, Y>;
      mockClear(): MockInstance<T, Y>;
      mockReset(): MockInstance<T, Y>;
      mockRestore(): MockInstance<T, Y>;
    }

    type Mock<T = any, Y extends any[] = any[]> = MockInstance<T, Y>;
  }

  const jest: {
    fn: <T = unknown, Y extends any[] = any[]>(implementation?: (...args: Y) => T) => jest.Mock<T, Y>;
    mock: (moduleName: string, factory?: () => unknown, options?: { virtual?: boolean }) => void;
    spyOn: <T extends object, M extends keyof T>(object: T, method: M) => jest.Mock<T[M], []>;
    clearAllMocks: () => void;
    resetAllMocks: () => void;
    resetModules: () => void;
    restoreAllMocks: () => void;
  };

  function describe(name: string, fn: () => void | Promise<void>): void;
  function beforeAll(fn: () => void | Promise<void>): void;
  function beforeEach(fn: () => void | Promise<void>): void;
  function afterEach(fn: () => void | Promise<void>): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function expect(actual: any): any;
}
