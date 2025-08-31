# Contributing to BlogNow SDK

Thank you for your interest in contributing to the BlogNow SDK! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository**
   ```bash
   git clone https://github.com/synkc0/blognow-js-sdk.git
   cd blognow-js-sdk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run tests**
   ```bash
   npm test
   ```

4. **Start developing**
   ```bash
   npm run dev  # Start TypeScript compiler in watch mode
   ```

## 📋 Development Process

### Setting up your environment

- **Node.js**: Version 14 or higher
- **npm**: Latest version recommended
- **Git**: For version control

### Making Changes

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Follow the existing code style
   - Add tests for new functionality
   - Update documentation as needed

3. **Run the full test suite**
   ```bash
   npm run test:coverage  # Run tests with coverage
   npm run lint           # Check code style
   npm run typecheck      # Verify TypeScript types
   npm run build          # Ensure everything builds
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature" # Use conventional commits
   ```

5. **Push and create a PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 📝 Code Style & Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Avoid `any` types (use `unknown` if necessary)
- Provide complete JSDoc comments for public APIs
- Use descriptive variable and function names
- Follow existing naming conventions

### Code Organization

```
src/
├── client.ts          # Main client class
├── types/             # TypeScript definitions
│   ├── index.ts       # Main exports
│   ├── common.ts      # Shared types
│   └── posts.ts       # Posts-specific types
├── services/          # API service classes
│   └── posts.ts       # Posts service implementation
└── utils/             # Utility functions
    ├── http.ts        # HTTP client
    └── errors.ts      # Error classes
```

### Testing Standards

- Write unit tests for all new functionality
- Maintain >90% code coverage
- Use descriptive test names
- Mock external dependencies
- Test error scenarios

Example test structure:
```typescript
describe('FeatureName', () => {
  describe('method', () => {
    it('should do something when given valid input', () => {
      // Test implementation
    });
    
    it('should throw error when given invalid input', () => {
      // Test error handling
    });
  });
});
```

## 🔄 Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/) for consistent commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples
```bash
feat(posts): add search functionality
fix(http): handle timeout errors correctly
docs(readme): update installation instructions
test(posts): add pagination tests
```

## 🧪 Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Test Structure

- Unit tests in `tests/` directory
- Test files follow `*.test.ts` pattern
- Mock HTTP requests using Jest mocks
- Test both success and error scenarios

### Writing Tests

```typescript
import { BlogNowClient } from '../src/client';

describe('BlogNowClient', () => {
  const validConfig = {
    apiKey: 'test-key'
  };

  it('should create client successfully', () => {
    const client = new BlogNowClient(validConfig);
    expect(client).toBeDefined();
  });
});
```

## 📚 Documentation

### JSDoc Comments

All public APIs should have complete JSDoc comments:

```typescript
/**
 * Retrieves published posts with optional filtering and pagination.
 * 
 * @param options - Configuration options for filtering and pagination
 * @returns Promise that resolves to paginated posts response
 * 
 * @example
 * ```typescript
 * const posts = await client.posts.getPublishedPosts({
 *   page: 1,
 *   size: 10,
 *   sortBy: 'created_at'
 * });
 * ```
 */
async getPublishedPosts(options?: GetPostsOptions): Promise<PaginatedResponse<Post>> {
  // Implementation
}
```

### README Updates

When adding new features:
1. Update the API reference section
2. Add usage examples
3. Update the table of contents if needed

## 🚢 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Breaking changes increment MAJOR
- New features increment MINOR
- Bug fixes increment PATCH

### Creating Releases

Use the provided release scripts:

```bash
npm run release:patch    # Bug fixes
npm run release:minor    # New features
npm run release:major    # Breaking changes
npm run release:alpha    # Alpha pre-release
npm run release:beta     # Beta pre-release
npm run release:rc       # Release candidate
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the problem
3. **Expected vs actual behavior**
4. **Code example** demonstrating the issue
5. **Environment details** (Node.js version, OS, etc.)
6. **SDK version** you're using

## 💡 Feature Requests

For feature requests, please:

1. **Describe the problem** you're trying to solve
2. **Propose a solution** with examples
3. **Consider alternatives** and explain why your approach is best
4. **Provide usage examples** showing how the feature would work

## ❓ Questions & Support

- 🐛 **Bug reports**: [Create an issue](https://github.com/synkc0/blognow-js-sdk/issues)
- ✨ **Feature requests**: [Create a feature request](https://github.com/synkc0/blognow-js-sdk/issues)
- 📧 **Email support**: info@synk.consulting

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same [MIT License](LICENSE) that covers the project.

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- CHANGELOG.md for significant contributions
- README.md acknowledgments section

Thank you for contributing to BlogNow SDK! 🎉