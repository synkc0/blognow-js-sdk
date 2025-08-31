# Security Policy

## Supported Versions

We actively support the following versions of BlogNow SDK with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in the BlogNow SDK, please report it responsibly:

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please email us at: **info@synk.consulting**

Include the following information:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact and severity
- Any suggested fixes or mitigations
- Your contact information (optional, for follow-up)

### Response Process

1. **Acknowledgment**: We'll acknowledge your report within 24 hours
2. **Investigation**: We'll investigate and assess the vulnerability within 5 business days
3. **Fix Development**: We'll develop and test a fix
4. **Disclosure**: We'll coordinate responsible disclosure with you

### Security Best Practices

When using the BlogNow SDK:

#### API Key Security
- **Never commit API keys** to version control
- **Use environment variables** for API keys in production
- **Rotate API keys** regularly
- **Use least privilege** - only request necessary permissions

```typescript
// ❌ Don't do this
const client = new BlogNowClient({
  apiKey: 'blognow_key_abc123' // Hard-coded key
});

// ✅ Do this instead
const client = new BlogNowClient({
  apiKey: process.env.BLOGNOW_API_KEY
});
```

#### Network Security
- **Always use HTTPS** (the SDK enforces this)
- **Validate SSL certificates** in production environments
- **Implement request timeouts** to prevent hanging requests

#### Data Handling
- **Sanitize user input** before sending to API
- **Validate API responses** before using data
- **Don't log sensitive data** in production

#### Error Handling
- **Don't expose internal errors** to end users
- **Log security events** for monitoring
- **Handle rate limiting** appropriately

### Vulnerability Disclosure Timeline

- **Day 0**: Vulnerability reported
- **Day 1**: Acknowledgment sent
- **Day 5**: Initial assessment completed
- **Day 10-30**: Fix developed and tested
- **Day 30**: Security advisory published (if applicable)
- **Day 30+**: Public disclosure (coordinated with reporter)

### Security Updates

Security updates will be:
- Released as patch versions (e.g., 1.0.1)
- Clearly marked in release notes
- Communicated via GitHub Security Advisories
- Published to npm immediately

### Contact

For security-related questions or concerns:
- **Email**: info@synk.consulting
- **GPG Key**: Available upon request

Thank you for helping keep BlogNow SDK secure! 🔒