# End-2-End Testing
The end-to-end system test has been implemented using the Playwright library in Python. It simulates a user searching for a destination, choosing a hotel, filling up the booking form and booking the hotel.
### Quickstart
Installing the required libraries:
```
$ pipenv shell
(e2e_testing) $ pipenv install
```
Installing Playwright's browsers:
```
(e2e_testing) $ playwright install
```
Running the test:
```
(e2e_testing) $ python3 main.py
```
### Test Cases
The end-to-end test case that has been chosen to be tested is the process of a user trying to book a hotel. Specifically, it simulates a user entering the destination, selecting the dates of stay and number of guests, then clicking on a hotel, clicking the "book hotel" button, filling up the booking form which includes name, email address etc., and finally clicking the "book" bu.
