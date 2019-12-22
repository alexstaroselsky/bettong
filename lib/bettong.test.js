const Bettong = require('./bettong');

describe('Bettong', () => {
  it('should create an instance of Bettong', () => {
    expect(new Bettong('foo')).toBeInstanceOf(Bettong);
  });
});
