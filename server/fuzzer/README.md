# Fuzzer
A simple fuzzer to test the robustness of our server
### Quick Start
Installing dependencies
```
$ pipenv shell
(fuzzer) $ pipenv install
```
Running the fuzzer
> The server has to be running before running the fuzzer
```
(fuzzer) $ python3 main.py 
```
### The Tests
The fuzzer will run 3 different kinds of fuzzing agains the server:
1. A low-level fuzzer that generates random bytes as HTTP requests to test the robustness of the server
2. A fuzzer that generates sequences of random requests to test the API routers
3. A high level fuzzer that fuzzes the parameters of the API route /api/destinations/search