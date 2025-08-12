from hypothesis import given, settings, strategies as st
import requests, time, socket


HOST = "localhost"
PORT = 5001
BASE_URL = f"http://{HOST}:{PORT}"
AUTOCOMPLETE_URL = f"http://{HOST}:{PORT}/api/destinations/search"


@given(
    query = st.text(min_size=2, max_size=1000),
    limit = st.integers(min_value=1, max_value=1000)
)
@settings(deadline=3000)
def test_autocomplete_params(query, limit):
    time.sleep(1)  # 1s between calls to delay 429 responses
    q = f"?q={query}&limit={limit}"
    print(f"Query sent: {q}")
    response = requests.get(AUTOCOMPLETE_URL + q)
    print(response)

    # Robustness checks
    assert response.status_code in {200, 400, 429, 500}, f"Unexpected status code: {response.status_code}"

    # Handle 429 rate limit
    if response.status_code != 429:
        assert "application/json" in response.headers.get("Content-Type")

        # ensure it returns valid JSON
        try:
            data = response.json()
            assert "destinations" in data or "error" in data
        except ValueError:
            assert False, "Response is not valid JSON"


@given(st.binary(min_size=1, max_size=1024))
@settings(deadline=3000)
def test_low_level_fuzz(random_bytes):
    time.sleep(1)  # 1s between calls to delay 429 responses
    print(f"Sent: {random_bytes}")
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2)
    try:
        s.connect((HOST, PORT))
        s.sendall(random_bytes)
        try:
            data = s.recv(1024)
            print(f"Received: {data}")
            if data:
                assert b"HTTP/1.1 400 Bad Request" in data
        except socket.timeout:
            # no response within timeout, acceptable if server keeps connection open
            pass
    except socket.error:
        pass  # connection dropped
    finally:
        s.close()


@settings(deadline=None)
@given(method=st.sampled_from(["GET", "POST", "PUT", "DELETE", "PATCH"]), path=st.text(alphabet=st.characters(min_codepoint=32, max_codepoint=126), min_size=1, max_size=20))
def test_route_sequence_fuzz(method, path):
    time.sleep(1)   # avoid 429 responses
    url = f"{BASE_URL}/{path}"
    print(f"URL: {url}")
    try:
        r = requests.request(method, url)
        print(r)
        # Property: Router should respond with valid HTTP code
        assert r.status_code in {200, 201, 204, 400, 401, 403, 404, 405, 422}, f"Unexpected code {r.status_code} for {req}"

    except requests.RequestException:
        # Connection issues are acceptable in fuzzing
        pass 


if __name__ == "__main__":
    print("\nTesting routes...\n")
    test_route_sequence_fuzz()
    print("\nTesting parameters for autocomplete functionality...\n")
    test_autocomplete_params()
    print("\nTesting low level server responses...\n")
    test_low_level_fuzz()

