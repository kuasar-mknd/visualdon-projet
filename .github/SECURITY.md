# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version  | Supported |
| -------- | --------- |
| Latest   | ✅ Yes    |
| < Latest | ❌ No     |

## 🚨 Reporting a Vulnerability

**Please do NOT report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability in this project, please report it responsibly:

### Preferred Method: Private Vulnerability Reporting

1. Go to the [Security tab](https://github.com/kuasar-mknd/visualdon-projet/security)
2. Click "Report a vulnerability"
3. Fill out the vulnerability report form with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if you have one)

### Alternative Method: Email

If you prefer, you can email the maintainers directly. Please include:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## 📋 What to Expect

After you submit a vulnerability report:

1. **Acknowledgment**: We'll acknowledge receipt within 48 hours
2. **Assessment**: We'll assess the vulnerability and determine its severity
3. **Updates**: We'll keep you informed of our progress
4. **Fix**: We'll work on a fix and coordinate disclosure timing with you
5. **Credit**: We'll credit you in the security advisory (unless you prefer to remain anonymous)

## 🛡️ Security Best Practices

This project follows these security practices:

### Dependencies

- Dependencies are regularly updated via Dependabot
- Security advisories are monitored and addressed promptly
- Only trusted, well-maintained packages are used

### Data Handling

- No sensitive user data is collected or stored
- All data sources are from trusted, official organizations
- Data is served over HTTPS only

### Code Quality

- Code is reviewed before merging
- ESLint is used to catch potential issues
- No secrets or API keys are committed to the repository

### Deployment

- Deployed on Cloudflare Pages with automatic HTTPS
- Content Security Policy headers configured
- Regular security scans performed

## 🔍 Known Security Considerations

### Data Source Integrity

This project relies on data from the Global Carbon Budget (Zenodo). We:

- Verify data source URLs use HTTPS
- Document data provenance clearly
- Implement automated data updates with validation

### Client-Side Security

As a client-side application:

- No server-side processing of user input
- No authentication or user accounts
- No cookies or local storage of sensitive data
- All external API calls are to trusted sources only

## 📚 Security Resources

- [GitHub Security Advisories](https://github.com/kuasar-mknd/visualdon-projet/security/advisories)
- [Dependabot Alerts](https://github.com/kuasar-mknd/visualdon-projet/security/dependabot)
- [OWASP Top Ten](https://owasp.org/www-project-top-ten/)

## 🙏 Responsible Disclosure

We kindly ask that you:

- Give us reasonable time to address the vulnerability before public disclosure
- Make a good faith effort to avoid privacy violations, data destruction, and service disruption
- Do not exploit the vulnerability beyond what is necessary to demonstrate it

We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

## 📞 Contact

For security-related questions that are not vulnerabilities, please open a [GitHub Discussion](https://github.com/kuasar-mknd/visualdon-projet/discussions).

---

**Last Updated**: November 2025
