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

  it('should exclude pages already added to visited', () => {
    const bettong = new Bettong('foo');
    bettong.visited.push('foo.bar');

    expect(bettong._isValidPage('foo.bar')).toEqual(false);
  });

  it('should exclude pages already added to queue', () => {
    const bettong = new Bettong('foo');
    bettong.queue.push('foo.bar');

    expect(bettong._isValidPage('foo.bar')).toEqual(false);
  });

  it('should exclude pages that match exclude pattern', () => {
    const bettong = new Bettong('foo', 'bar', { excludePattern: 'bar' });

    expect(bettong._isValidPage('foo.bar')).toEqual(false);
  });
});
