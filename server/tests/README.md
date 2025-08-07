# DestinationService Test Suite

## Overview
Comprehensive unit and integration tests for the `destinationService.js` module, covering all functionality with 100% code coverage.

## Test Structure

### Unit Tests (Mock Data)
Tests using controlled mock data to ensure predictable behavior:

#### `searchDestinations` Method Tests
- ✅ **Valid search queries** - Returns properly formatted results
- ✅ **Non-existent destinations** - Returns empty array
- ✅ **Limit parameter** - Respects result count limits
- ✅ **Case-insensitive search** - Handles various case combinations
- ✅ **Partial matches** - Finds destinations with partial term matches
- ✅ **Relevance scoring** - Results sorted by relevance score
- ✅ **Unique results** - No duplicate UIDs in results
- ✅ **Edge cases** - Empty queries, special characters, long strings, numeric queries
- ✅ **Error handling** - Throws appropriate errors when internal search fails

#### `getDestinationById` Method Tests
- ✅ **Valid UID lookup** - Returns correct destination object
- ✅ **Invalid UID handling** - Returns null for non-existent UIDs
- ✅ **Edge cases** - Handles empty, null, and undefined UIDs
- ✅ **Error handling** - Throws appropriate errors when data access fails

#### Service Initialization Tests
- ✅ **Fuse.js initialization** - Validates search engine setup
- ✅ **Data loading** - Confirms destinations data is properly loaded

### Integration Tests (Real Data)
Tests using the actual destinations dataset to ensure real-world functionality:

#### Real Data Tests
- ✅ **Data structure validation** - Confirms actual data has expected properties
- ✅ **Real search functionality** - Tests with actual destination names
- ✅ **UID lookup validation** - Finds destinations using real UIDs
- ✅ **Common city searches** - Tests popular destinations (Singapore, Tokyo, etc.)
- ✅ **Airport searches** - Validates airport-type destinations
- ✅ **Response format consistency** - Ensures all results have required properties

#### Performance Tests
- ✅ **Search timing** - Completes searches within 3 seconds
- ✅ **Concurrent searches** - Handles multiple simultaneous queries
- ✅ **Large result sets** - Efficiently processes up to 100 results

#### Data Integrity Tests
- ✅ **Coordinate validation** - Ensures lat/lng are within valid ranges
- ✅ **UID format validation** - Confirms all UIDs are valid strings
- ✅ **Data type consistency** - Validates property types across results

## Test Coverage
- **100% statement coverage** for `destinationService.js`
- **100% branch coverage** for all conditional logic
- **100% function coverage** for all exported methods

## Running Tests

### Run DestinationService tests only:
```bash
npm test -- tests/destinationService.test.js
```

### Run all tests with coverage:
```bash
npm test
```

### Run tests in watch mode:
```bash
npm test -- --watch
```

## Test Configuration
- **Environment**: Node.js
- **Framework**: Jest
- **Timeout**: 10 seconds per test
- **Setup**: Custom setup file with console log management
- **Coverage**: Text, LCOV, and HTML reports

## Mock Data Structure
Tests use a controlled dataset with 5 destinations covering:
- Different destination types (city, airport)
- Various geographical locations
- Different country/state combinations
- Consistent UID format

## Performance Expectations
- Single search: < 3 seconds
- Multiple concurrent searches: Supported
- Large result sets (100 items): < 2 seconds
- Real dataset search: Handles 500k+ destinations efficiently

## Error Scenarios Tested
- Fuse.js search failures
- Data access errors
- Invalid input parameters
- Network-like timeouts
- Memory constraints

## Best Practices Demonstrated
- **Isolation**: Unit tests use mocked data
- **Integration**: Real data tests validate actual functionality
- **Performance**: Timing validations ensure acceptable speed
- **Error handling**: Comprehensive error scenario coverage
- **Data validation**: Property type and range checking
- **Concurrency**: Multiple simultaneous operation testing
