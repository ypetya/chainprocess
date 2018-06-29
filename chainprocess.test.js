const chainprocess = require('./chainprocess');
const cp = require('child_process');

const flushPromises = () => {
    return new Promise(resolve => setImmediate(resolve));
}

console.log = jest.fn();

describe('chainprocess', () => {
    describe('runs a process', () => {
        let spy;
        beforeEach(() => {
            cp.exec = spy = jest.fn((string, cb) => 
                string === 'STOP' ? cb('stopped!') : cb(undefined, `ok:${string}`, undefined));
        });
        it('starts a process', () => {
            const chain=chainprocess('start').chain('end').chain('real end');
            expect(spy).not.toHaveBeenCalled();
            chain.run();
            expect(spy).toBeCalledWith('start', expect.any(Function));
            return flushPromises().then(()=>{
                expect(spy).toHaveBeenCalledWith('end', expect.any(Function));
                expect(spy).toHaveBeenCalledWith('real end', expect.any(Function));
            });
        });
        it('chains the stdout', () => {
            chainprocess('start')
                .chain(input => expect(input).toBe('ok:start'))
                .run();
            return flushPromises().then(()=>{});
        });
        it('stops the chain on non null exit code', done => {
            chainprocess('start')
                .chain('STOP')
                .chain(()=>expect(true).toBe(false))
                .run()
                .catch( err => {
                    expect(err).toBe('stopped!');
                    done();
                });
        });
    });
    describe('runs a function', () => {
        it('calls with input', done => {
            chainprocess(()=> 'output')
            .chain( input => expect(input).toBe('output'))
            .chain(done)
            .run();
        });
        it('chains with return value', done => {
            chainprocess(()=> 42)
            .chain( input => expect(input).toBe(42))
            .chain(done)
            .run();
        });
        it('stops the chain on function return value', done => {
            chainprocess()
            .chain(()=> () => 'error')
            .chain(()=>expect(false).toBe(true))
            .run()
            .catch(err=>{
                expect(err).toBe('error');
                done();
            });
        });
    })
    describe('promise', () => {
        it('can be part of the chain', done => {
            chainprocess(Promise.resolve("ok"))
            .chain(Promise.resolve('ok2'))
            .chain(()=>{
                done();
            }).run();
        });
        it('can break a chain', done => {
            chainprocess(Promise.resolve("ok"))
            .chain(input => expect(input).toBe('ok'))
            .chain(Promise.reject('not ok'))
            .chain(()=>{
                expect(true).toBe(false);
                done();
            })
            .run()
            .catch(err=>{
                expect(err).toBe('not ok');
                done();
            })
        })
    });
});