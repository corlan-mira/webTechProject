# Contributing Guidelines

Thank you for contributing to the Event Attendance Monitoring System! This document outlines the process for contributing to this project.

---

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Report issues responsibly

---

## Getting Started

### 1. Fork the Repository
```bash
# Click "Fork" on GitHub
git clone https://github.com/YOUR_USERNAME/event-attendance-system.git
cd event-attendance-system
```

### 2. Create Feature Branch
```bash
# Follow naming convention: feature/TASK-ID-description
git checkout -b feature/EV-001-event-creation
```

### 3. Make Changes
- Follow code style guidelines
- Write clear, descriptive commits
- Add tests for new features
- Update documentation

### 4. Submit Pull Request
- Push to your fork
- Create PR with clear description
- Link related issues
- Wait for review

---

## Development Workflow

### Setting Up Development Environment

```bash
# Install dependencies
npm install

# Copy .env.example
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure for development
# Edit .env files with local settings

# Start development servers
npm run dev
```

### Code Style

#### JavaScript/Node.js
- **Indentation:** 2 spaces (enforced by Prettier)
- **Semicolons:** Yes (enforced by ESLint)
- **Quotes:** Double quotes (enforced by Prettier)
- **Variable naming:** camelCase
- **Constants:** UPPERCASE_WITH_UNDERSCORES
- **Files:** camelCase or kebab-case

**Example:**
```javascript
// Good
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Bad
const CalculateTotal = (items) => {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += items[i].price;
  }
  return sum;
};
```

#### React/JSX
- **Component naming:** PascalCase (e.g., EventForm.jsx)
- **Hooks:** Use custom hooks for reusable logic
- **Props:** Destructure in function parameters
- **State:** Use useState for simple state, Context for global

**Example:**
```jsx
// Good
const EventForm = ({ onSubmit, initialValues }) => {
  const [formData, setFormData] = useState(initialValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
};

// Bad
const eventform = (props) => {
  let formData = props.initialValues;
  function handleSubmit() {
    props.onSubmit(formData);
  }
  return <form></form>;
};
```

### Commit Guidelines

#### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Dependencies, tooling

#### Examples
```bash
git commit -m "feat(auth): implement JWT-based authentication"

git commit -m "fix(check-in): prevent duplicate check-ins

- Add unique constraint check
- Validate participant email per event
- Return 409 Conflict on duplicate

Closes #42"

git commit -m "docs(api): update endpoint documentation"

git commit -m "style(prettier): reformat code with prettier config"
```

### Testing

#### Backend Tests
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- eventService.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

#### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

**Test Requirements:**
- New features must include unit tests
- Bug fixes should include regression tests
- Minimum 60% code coverage
- All tests must pass before PR approval

### Linting & Formatting

```bash
# Check code style
npm run lint

# Fix formatting issues automatically
npm run format

# Fix ESLint issues
npm run lint -- --fix
```

---

## Pull Request Process

### Before Creating PR

1. **Update from main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run tests locally:**
   ```bash
   npm test
   ```

3. **Check formatting:**
   ```bash
   npm run lint
   npm run format
   ```

4. **Build frontend:**
   ```bash
   cd frontend
   npm run build
   ```

### Creating PR

**Title Format:**
```
<type>(<scope>): <description>

Example:
feat(event-creation): add multi-line event description field
```

**Description Template:**
```markdown
## Description
Brief description of changes and motivation.

## Changes
- Bullet point 1
- Bullet point 2

## Related Issue
Closes #42

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation

## Testing
Describe how this was tested.

## Screenshots
[If applicable: Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes
- [ ] Passes all checks
```

### Review Process

1. **Automated Checks:**
   - ESLint passes
   - All tests pass
   - Build successful
   - Code coverage maintained

2. **Manual Review:**
   - Code quality assessment
   - Logic verification
   - Architecture review
   - Documentation review

3. **Approval:**
   - Minimum 2 approvals required
   - All discussions resolved
   - All checks passing

4. **Merge:**
   - Squash commits (optional)
   - Delete branch
   - Monitor for regressions

---

## Documentation

### Code Documentation

#### JSDoc Format
```javascript
/**
 * Generate a unique alphanumeric access code for an event.
 * @param {number} length - Code length (default: 11)
 * @returns {string} - Access code (e.g., "ABC-123-XYZ")
 * @throws {Error} If length is negative
 * @example
 * const code = generateAccessCode(11);
 * // Returns: "ABC-123-XYZ"
 */
function generateAccessCode(length = 11) {
  // Implementation
}
```

#### React Component Documentation
```jsx
/**
 * Form component for creating and editing events.
 * @component
 * @param {Object} props - Component props
 * @param {Event} props.event - Event data (null for new event)
 * @param {Function} props.onSubmit - Callback on form submission
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Event form component
 * @example
 * <EventForm
 *   event={null}
 *   onSubmit={handleCreateEvent}
 *   isLoading={false}
 * />
 */
const EventForm = ({ event, onSubmit, isLoading }) => {
  // Implementation
};
```

### File Documentation

Update relevant docs when:
- Adding new API endpoints → Update [docs/API.md](./docs/API.md)
- Modifying database schema → Update [docs/DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md)
- Changing architecture → Update [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- New setup requirement → Update [docs/SETUP.md](./docs/SETUP.md)

---

## Common Scenarios

### Adding a New Feature

1. **Create feature branch:**
   ```bash
   git checkout -b feature/EV-XXX-feature-name
   ```

2. **Backend implementation:**
   - Create model (if needed)
   - Create controller
   - Create routes
   - Add middleware/validation
   - Write tests

3. **Frontend implementation:**
   - Create components
   - Create API service
   - Create custom hooks
   - Write tests

4. **Documentation:**
   - Update API.md with endpoints
   - Update ARCHITECTURE.md if needed
   - Add comments in code

5. **Testing:**
   - Manual testing in browser
   - API testing with Postman
   - Unit tests passing
   - No regressions

### Fixing a Bug

1. **Create bug branch:**
   ```bash
   git checkout -b bugfix/BUG-XXX-bug-name
   ```

2. **Write failing test:**
   - Test reproduces the bug
   - Test fails before fix

3. **Implement fix:**
   - Minimal changes
   - No scope creep

4. **Verify test passes:**
   - New test passes
   - Existing tests still pass
   - No new issues introduced

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update express@latest

# Update all packages (careful!)
npm update

# Review changes
git diff package.json

# Test thoroughly
npm test
npm run build
```

---

## Project Structure

### Backend Structure
```
backend/
├── config/           # Database and env config
├── controllers/      # Request handlers
├── models/          # Sequelize models
├── routes/          # API route definitions
├── middleware/      # Custom middleware
├── services/        # Business logic
├── utils/           # Helper functions
├── migrations/      # Database migrations
├── tests/           # Test files
└── server.js        # Entry point
```

### Frontend Structure
```
frontend/src/
├── components/      # Reusable components
├── pages/          # Page components
├── services/       # API service layer
├── hooks/          # Custom React hooks
├── context/        # React Context
├── utils/          # Utility functions
└── App.jsx         # Main app
```

---

## Release Process

### Version Bumping
```bash
# Follows semantic versioning: MAJOR.MINOR.PATCH

# Patch release (bug fixes)
npm version patch

# Minor release (new features)
npm version minor

# Major release (breaking changes)
npm version major
```

### Release Checklist
- [ ] All tests passing
- [ ] All issues closed
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] GitHub release created
- [ ] Deployment verified

---

## Resources

### Documentation
- [Phase 1 Specification](../PHASE_1_SPECIFICATION.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Database Schema](./DATABASE_SCHEMA.md)

### Tools
- **Testing:** Jest
- **Linting:** ESLint
- **Formatting:** Prettier
- **API Testing:** Postman, Thunder Client

### Learning Resources
- [JavaScript Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [Sequelize ORM](https://sequelize.org/)

---

## Questions?

- Check existing issues
- Review documentation
- Ask in pull request
- Contact maintainers

---

**Thank you for contributing!** 🎉

Your contributions help make this project better for everyone.
