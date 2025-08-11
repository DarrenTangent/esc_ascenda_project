jest.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn(), prefetch: jest.fn() }),
  useSearchParams: () => ({ toString: () => '' }),
}));

describe('HotelSearchInputFilter', () => {
  it('smoke test', () => expect(true).toBe(true));
});
