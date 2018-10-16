title: How to unit test
speaker: trimmer
transition: slide2
theme: moon

[slide]

# How to do a unit test

[slide]

#What are include in a unit test?
----
* Test Runners - [mocha-webpack](https://github.com/zinserjan/mocha-webpack) {:&.rollIn}
* Test Frameworks - [mocha](https://github.com/mochajs/mocha)
* Assertion frameworks - [chai](https://github.com/chaijs/chai)/expect/Sinon
* Code coverage tool -[nyc](https://github.com/istanbuljs/nyc)
 
[slide]
# Guides
----
* [How to config with mocha-webpack](https://github.com/zinserjan/mocha-webpack/blob/master/docs/guides/code-coverage.md) {:&.rollIn}
* [Ide debug](https://github.com/zinserjan/mocha-webpack/blob/master/docs/guides/ide-integration.md)

[slide]

# View the code
----
[code](http://stash.woger.local/projects/OP/repos/order-portal/pull-requests/75/diff#test/HomeDelivery.spec.js)

[slide]
# How to run it

```sh
#run the init test
npm run test

#run include coverage
npm run test:coverage
```

[slide]
# View the coverage report

----
[report](http://192.168.40.124/coverage/)

[slide]
# Api docs
----
* [Vue test Utils](https://vue-test-utils.vuejs.org/zh/)
* [vuex]https://vuex.vuejs.org/zh/guide/testing.html
* [chai](http://www.chaijs.com/api/bdd/#method_language-chains)