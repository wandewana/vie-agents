# AI Agent Prompt Templates

This file contains tech-agnostic prompt templates for common development tasks. Use these templates when sending tasks to your AI agents.

## 🎯 General Principles

**Good Prompts:**
- ✅ Specific and detailed
- ✅ Include acceptance criteria
- ✅ Mention testing requirements
- ✅ Tech-agnostic (let Claude detect the stack)

**Bad Prompts:**
- ❌ Vague ("add feature X")
- ❌ Too broad ("build entire module")
- ❌ No testing mentioned

---

## 📋 Template Categories

### 1. **CRUD Operations**

```
Create a {ENTITY} management feature with full CRUD operations.

Requirements:
- Create endpoint/route to create {ENTITY} with fields: {FIELD1}, {FIELD2}, {FIELD3}
- Read endpoint to get {ENTITY} by ID
- Update endpoint to modify {ENTITY}
- Delete endpoint to remove {ENTITY}
- List endpoint with pagination (page size: 20)
- Add input validation for all fields
- Add database persistence
- Write integration tests that verify all CRUD operations work correctly

Acceptance Criteria:
- All endpoints return proper HTTP status codes
- Validation errors return 400 with clear messages
- Tests pass successfully
```

**Example:**
```
Create a Land management feature with full CRUD operations.

Requirements:
- Create endpoint/route to create Land with fields: title, description, price, area, location (latitude/longitude), ownerId
- Read endpoint to get Land by ID
- Update endpoint to modify Land
- Delete endpoint to remove Land
- List endpoint with pagination (page size: 20)
- Add input validation for all fields (price > 0, area > 0, valid coordinates)
- Add database persistence
- Write integration tests that verify all CRUD operations work correctly

Acceptance Criteria:
- All endpoints return proper HTTP status codes
- Validation errors return 400 with clear messages
- Tests pass successfully
```

---

### 2. **Search & Filtering**

```
Implement search functionality for {ENTITY}.

Requirements:
- Add search endpoint that accepts query parameters: {PARAM1}, {PARAM2}, {PARAM3}
- Support filtering by {FILTER_FIELDS}
- Support sorting by {SORT_FIELDS} (ascending/descending)
- Add pagination (default page size: 20)
- Return total count of results
- Optimize database queries for performance
- Write integration tests for various search scenarios

Acceptance Criteria:
- Search works with partial matches where appropriate
- Multiple filters can be combined
- Empty results return 200 with empty array
- Tests cover edge cases (no results, all filters, sorting)
```

**Example:**
```
Implement search functionality for Land.

Requirements:
- Add search endpoint that accepts query parameters: keyword, minPrice, maxPrice, minArea, maxArea, location (lat/lng + radius)
- Support filtering by price range, area range, location proximity
- Support sorting by price, area, createdDate (ascending/descending)
- Add pagination (default page size: 20)
- Return total count of results
- Optimize database queries for performance (use spatial indexes if available)
- Write integration tests for various search scenarios

Acceptance Criteria:
- Search works with partial matches on title/description
- Multiple filters can be combined
- Location search uses geospatial queries if database supports it
- Empty results return 200 with empty array
- Tests cover edge cases (no results, all filters, sorting)
```

---

### 3. **Authentication & Authorization**

```
Implement {AUTH_TYPE} authentication.

Requirements:
- Add user registration endpoint with fields: {FIELDS}
- Add login endpoint that returns authentication token
- Add password hashing (use industry standard algorithm)
- Add middleware/filter to protect routes
- Add logout functionality
- Store user sessions/tokens securely
- Write integration tests for auth flow

Acceptance Criteria:
- Passwords are never stored in plain text
- Invalid credentials return 401
- Protected routes return 401 without valid token
- Tests verify complete auth flow (register → login → access protected route → logout)
```

---

### 4. **Database Schema/Migration**

```
Create database schema for {ENTITY}.

Requirements:
- Add table/collection for {ENTITY} with fields: {FIELD_LIST}
- Add appropriate indexes for {INDEXED_FIELDS}
- Add foreign key constraints for {RELATIONSHIPS}
- Add timestamps (createdAt, updatedAt)
- Create migration script that can be rolled back
- Add seed data for testing (optional)

Acceptance Criteria:
- Migration runs successfully
- Rollback works correctly
- Indexes improve query performance
- Foreign keys maintain referential integrity
```

---

### 5. **API Integration**

```
Integrate with {EXTERNAL_SERVICE} API.

Requirements:
- Create service/client to communicate with {API_NAME}
- Implement endpoints: {ENDPOINT_LIST}
- Add error handling for API failures
- Add retry logic with exponential backoff
- Add request/response logging
- Store API credentials securely (environment variables)
- Add timeout configuration
- Write integration tests (use mocking for external API)

Acceptance Criteria:
- API calls handle network errors gracefully
- Sensitive data (API keys) not hardcoded
- Tests verify correct API request format
- Timeout prevents hanging requests
```

---

### 6. **Frontend Component**

```
Create {COMPONENT_NAME} component.

Requirements:
- Display {DATA_FIELDS}
- Add user interactions: {INTERACTIONS}
- Add form validation for inputs
- Show loading state while fetching data
- Show error messages on failure
- Make component responsive (mobile-friendly)
- Add accessibility attributes (ARIA labels)
- Write component tests

Acceptance Criteria:
- Component renders correctly with mock data
- Validation prevents invalid submissions
- Loading/error states display properly
- Works on mobile and desktop
- Tests verify user interactions
```

---

### 7. **Testing**

```
Write comprehensive tests for {FEATURE/MODULE}.

Requirements:
- Add unit tests for business logic
- Add integration tests for API endpoints
- Add end-to-end tests for critical user flows
- Achieve minimum {X}% code coverage
- Test edge cases and error scenarios
- Add test data fixtures/factories

Acceptance Criteria:
- All tests pass
- Coverage meets minimum threshold
- Tests are maintainable and well-organized
- CI/CD pipeline can run tests automatically
```

---

### 8. **Performance Optimization**

```
Optimize performance of {FEATURE}.

Requirements:
- Identify performance bottlenecks using profiling
- Add database query optimization (indexes, query rewriting)
- Add caching layer for frequently accessed data
- Implement pagination for large datasets
- Add lazy loading where appropriate
- Measure performance before and after changes

Acceptance Criteria:
- Response time reduced by at least {X}%
- Database queries use indexes effectively
- Cache hit rate > {Y}%
- No N+1 query problems
```

---

### 9. **Bug Fix**

```
Fix bug: {BUG_DESCRIPTION}

Steps to Reproduce:
1. {STEP_1}
2. {STEP_2}
3. {STEP_3}

Expected Behavior:
{EXPECTED}

Actual Behavior:
{ACTUAL}

Requirements:
- Identify root cause of the bug
- Implement fix with minimal code changes
- Add regression test to prevent bug from reoccurring
- Verify fix doesn't break existing functionality

Acceptance Criteria:
- Bug no longer reproducible
- All existing tests still pass
- New test fails before fix, passes after fix
```

---

### 10. **Refactoring**

```
Refactor {MODULE/COMPONENT} to improve {QUALITY_ASPECT}.

Requirements:
- Improve code readability and maintainability
- Extract reusable functions/classes
- Remove code duplication
- Follow project coding standards
- Add comments for complex logic
- Ensure all existing tests still pass

Acceptance Criteria:
- Code is more maintainable
- No functionality changes (behavior identical)
- Test coverage maintained or improved
- Code follows consistent style
```

---

## 🎨 Customization Tips

1. **Replace placeholders** in `{CURLY_BRACES}` with your specific values
2. **Add context** about your tech stack if needed (though Claude usually detects it)
3. **Be specific** about acceptance criteria
4. **Always mention testing** to ensure quality

---

## 📝 Quick Reference

**Minimal Prompt Structure:**
```
{ACTION} {FEATURE_NAME}

Requirements:
- {REQUIREMENT_1}
- {REQUIREMENT_2}
- {REQUIREMENT_3}

Acceptance Criteria:
- {CRITERIA_1}
- {CRITERIA_2}
```

**Example:**
```
Implement user profile update feature

Requirements:
- Add endpoint to update user profile (name, email, avatar)
- Validate email format
- Prevent duplicate emails
- Write integration tests

Acceptance Criteria:
- Users can update their profile
- Invalid emails rejected
- Tests pass
```

---

## 🚀 Pro Tips

1. **One feature per agent** - Don't combine multiple unrelated features
2. **Specify test requirements** - Always ask for tests to ensure quality
3. **Include edge cases** - Mention error scenarios, empty states, etc.
4. **Let Claude detect the stack** - No need to say "use Spring Boot" if the repo is already Spring Boot
5. **Review PRs carefully** - Agents are fast but not perfect
6. **Iterate if needed** - If the result isn't perfect, send a follow-up task to the same agent

---

## 📚 Examples by Tech Stack

### Java Spring Boot
```
Implement Land search API with geospatial filtering

Requirements:
- Create REST endpoint GET /api/lands/search
- Accept query params: lat, lng, radius (in km), minPrice, maxPrice
- Use PostGIS or spatial queries for location-based search
- Return lands within radius sorted by distance
- Add pagination (20 items per page)
- Write integration tests using TestRestTemplate

Acceptance Criteria:
- Geospatial queries work correctly
- Results sorted by proximity
- Tests verify search accuracy
```

### Node.js/Express
```
Implement rate limiting middleware

Requirements:
- Create middleware to limit requests per IP
- Allow 100 requests per 15 minutes per IP
- Return 429 status when limit exceeded
- Add Redis for distributed rate limiting
- Add configuration via environment variables
- Write tests for rate limit enforcement

Acceptance Criteria:
- Requests blocked after limit
- Rate limit resets after time window
- Works across multiple server instances
```

### React/Frontend
```
Create Land listing page with map view

Requirements:
- Display lands in a grid/list view
- Show interactive map with land markers
- Add filters: price range, area range, location
- Add sorting: price, area, date
- Show loading skeleton while fetching
- Handle empty state and errors
- Make responsive for mobile

Acceptance Criteria:
- Map markers clickable to show land details
- Filters update results in real-time
- Works on mobile and desktop
```

---

**Remember:** The more specific and detailed your prompt, the better the result! 🎯

