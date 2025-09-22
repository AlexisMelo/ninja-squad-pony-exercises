// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-mocha-reporter'),
      require('karma-coverage'),
      require('karma-firefox-launcher'),
      require('karma-json-reporter')
    ],
    client: {
      jasmine: {
        // you can add configuration options for Jasmine here
        // the possible options are listed at https://jasmine.github.io/api/edge/Configuration.html
        // for example, you can disable the random execution with `random: false`
        // or set a specific seed with `seed: 4321`
      }
    },
    jasmineHtmlReporter: {
      suppressAll: true // removes the duplicated traces
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/ponyracer'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'json-summary' }, { type: 'text-summary' }]
    },
    jsonReporter: {
      stdout: false,
      outputFile: require('path').join(__dirname, './results/karma-results.json')
    },
    reporters: process.env.CI === 'true' ? ['dots', 'json'] : ['mocha', 'json', 'kjhtml'],
    browsers: ['ChromeHeadless'],
    restartOnFileChange: true
  });
};
