const Bettong = require('./bettong');

describe('Bettong', () => {
  it('should create an instance of Bettong', () => {
    expect(new Bettong('foo')).toBeInstanceOf(Bettong);
  });

  it('should merge options with default options', () => {
    const options = {
      html: false,
      viewports: [
        { width: 1, height: 1 }
      ]
    };
    const bettong = new Bettong('foo', 'bar', options);
    const expected = {
      screenshot: true,
      html: false,
      viewports: [
        { width: 1, height: 1 }
      ]
    };
    expect(bettong.options).toEqual(expected);
  });
});
