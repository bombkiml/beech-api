process.env.NODE_ENV = 'test';
process.setMaxListeners(0);
/*@headRequest*/
const axios = require('axios');
path = require('path');
basePath = path.resolve();
config = require(path.join(basePath, 'app.config')).main_config;
baseUrl = config.local_nodejs;
endpoint = baseUrl.concat('/xxx/xxx');

describe('Test endpoint : '+ endpoint, () => { 
  it('Truthy!', () => { 
    expect('/xxx/xxx').toBeTruthy();
  });

  it('Say hello!', () => {
    expect('Hello xxx').toEqual('Hello xxx');
  });

  /** 
  * An asynchronous test will fail after 5000 ms if done() is not called.
  * This timeout can be changed by setting TIMEOUT_INTERVAL or by passing 
  * a timeout interval in the specification.
  * 
  */
  it("Respond with basic GET status code 200", (done) => {
    axios.get(endpoint)
      .then((res) => {
        expect(200).toEqual(res.data.code);
        done();
      })
  });

  /**
   * Anothor test.
   *
   */
});