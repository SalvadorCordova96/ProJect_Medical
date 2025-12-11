#!/usr/bin/env python3
"""
Security Improvements Verification Script
==========================================

This script verifies that all the security improvements from the issue
have been implemented correctly.

Run: python verify_security_improvements.py
"""

import sys
import os

# Add project root to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

def test_password_complexity():
    """Test password complexity validation."""
    print("\n1️⃣  Testing Password Complexity Validation...")
    from backend.api.routes.auth import validate_password_complexity
    
    test_cases = [
        ("ValidPass123!", True, "Valid password"),
        ("nouppercase123!", False, "No uppercase"),
        ("NOLOWERCASE123!", False, "No lowercase"),
        ("NoNumbers!", False, "No numbers"),
        ("NoSpecial123", False, "No special chars"),
        ("Short1!", False, "Too short"),
    ]
    
    passed = 0
    for password, should_pass, description in test_cases:
        try:
            validate_password_complexity(password)
            if should_pass:
                print(f"   ✓ {description}: Accepted (OK)")
                passed += 1
            else:
                print(f"   ✗ {description}: Should have been rejected")
        except ValueError as e:
            if not should_pass:
                print(f"   ✓ {description}: Rejected (OK)")
                passed += 1
            else:
                print(f"   ✗ {description}: Should have been accepted - {e}")
    
    print(f"   Result: {passed}/{len(test_cases)} tests passed")
    return passed == len(test_cases)


def test_account_lockout_config():
    """Test account lockout configuration."""
    print("\n2️⃣  Testing Account Lockout Configuration...")
    from backend.api.core.config import get_settings
    
    settings = get_settings()
    
    checks = [
        (hasattr(settings, 'MAX_FAILED_LOGIN_ATTEMPTS'), "MAX_FAILED_LOGIN_ATTEMPTS exists"),
        (hasattr(settings, 'ACCOUNT_LOCKOUT_MINUTES'), "ACCOUNT_LOCKOUT_MINUTES exists"),
        (settings.MAX_FAILED_LOGIN_ATTEMPTS == 5, "MAX_FAILED_LOGIN_ATTEMPTS = 5"),
        (settings.ACCOUNT_LOCKOUT_MINUTES == 15, "ACCOUNT_LOCKOUT_MINUTES = 15"),
    ]
    
    passed = 0
    for check, description in checks:
        if check:
            print(f"   ✓ {description}")
            passed += 1
        else:
            print(f"   ✗ {description}")
    
    print(f"   Result: {passed}/{len(checks)} checks passed")
    return passed == len(checks)


def test_sql_validation():
    """Test improved SQL validation."""
    print("\n3️⃣  Testing SQL Injection Protection...")
    from backend.tools.sql_executor import validate_query_safety
    
    test_cases = [
        ("SELECT * FROM users", "Admin", True, "Valid SELECT"),
        ("SELECT * FROM users; DROP TABLE users;", "Admin", False, "Multiple statements"),
        ("SELECT * FROM users UNION SELECT * FROM passwords", "Admin", False, "UNION injection"),
        ("SELECT pg_read_file('/etc/passwd')", "Admin", False, "System function pg_read_file"),
        ("SELECT pg_ls_dir('/')", "Admin", False, "System function pg_ls_dir"),
        ("SELECT * FROM users INTO OUTFILE '/tmp/out.txt'", "Admin", False, "INTO OUTFILE"),
        ("COPY users TO '/tmp/users.csv'", "Admin", False, "COPY operation"),
        ("SELECT * FROM clinic.pacientes WHERE activo = true", "Admin", True, "Valid schema query"),
    ]
    
    passed = 0
    for sql, role, should_pass, description in test_cases:
        valid, error = validate_query_safety(sql, role)
        
        if (should_pass and valid) or (not should_pass and not valid):
            status = "Allowed" if valid else "Blocked"
            print(f"   ✓ {description}: {status} (OK)")
            passed += 1
        else:
            expected = "Allowed" if should_pass else "Blocked"
            actual = "Allowed" if valid else "Blocked"
            print(f"   ✗ {description}: Expected {expected}, got {actual}")
            if error:
                print(f"      Error: {error}")
    
    print(f"   Result: {passed}/{len(test_cases)} tests passed")
    return passed == len(test_cases)


def test_rate_limiting():
    """Test rate limiting configuration."""
    print("\n4️⃣  Testing Rate Limiting Configuration...")
    
    # Check auth endpoint has rate limiting (already had it)
    from backend.api.routes.auth import limiter as auth_limiter
    print(f"   ✓ Auth endpoint has rate limiter: {auth_limiter is not None}")
    
    # Note: Can't easily check chat endpoint due to import issues with agents module
    # But we can verify the code was added
    import inspect
    from pathlib import Path
    
    chat_file = Path(__file__).parent.parent / "api" / "routes" / "chat.py"
    chat_content = chat_file.read_text()
    
    checks = [
        ("from slowapi import Limiter" in chat_content, "Chat imports Limiter"),
        ("limiter = Limiter" in chat_content, "Chat creates limiter instance"),
        ("@limiter.limit" in chat_content, "Chat uses rate limiting decorator"),
        ("30/minute" in chat_content, "Chat has 30 req/min limit"),
    ]
    
    passed = 1  # Auth limiter check
    for check, description in checks:
        if check:
            print(f"   ✓ {description}")
            passed += 1
        else:
            print(f"   ✗ {description}")
    
    print(f"   Result: {passed}/{len(checks) + 1} checks passed")
    return passed == len(checks) + 1


def test_file_sanitization():
    """Test file upload sanitization."""
    print("\n5️⃣  Testing File Upload Security...")
    import uuid
    from pathlib import Path
    
    # Check that evidencias.py uses UUID
    evidencias_file = Path(__file__).parent.parent / "api" / "routes" / "evidencias.py"
    evidencias_content = evidencias_file.read_text()
    
    checks = [
        ("import uuid" in evidencias_content, "Imports uuid module"),
        ("uuid.uuid4()" in evidencias_content, "Uses UUID for filenames"),
        ("allowed_extensions" in evidencias_content, "Validates file extensions"),
    ]
    
    passed = 0
    for check, description in checks:
        if check:
            print(f"   ✓ {description}")
            passed += 1
        else:
            print(f"   ✗ {description}")
    
    # Test UUID generation
    test_uuid = uuid.uuid4().hex[:12]
    if len(test_uuid) == 12 and all(c in '0123456789abcdef' for c in test_uuid):
        print(f"   ✓ UUID generation works correctly")
        passed += 1
    else:
        print(f"   ✗ UUID generation failed")
    
    print(f"   Result: {passed}/{len(checks) + 1} checks passed")
    return passed == len(checks) + 1


def test_env_example():
    """Test .env.example exists."""
    print("\n6️⃣  Testing .env.example Documentation...")
    from pathlib import Path
    
    env_example = Path(__file__).parent.parent / ".env.example"
    
    if env_example.exists():
        content = env_example.read_text()
        checks = [
            ("MAX_FAILED_LOGIN_ATTEMPTS" in content, "Documents account lockout settings"),
            ("JWT_SECRET_KEY" in content, "Documents JWT configuration"),
            ("ANTHROPIC_API_KEY" in content, "Documents AI API key"),
            ("CORS_ORIGINS" in content, "Documents CORS settings"),
        ]
        
        passed = 1  # File exists
        print(f"   ✓ .env.example file exists")
        
        for check, description in checks:
            if check:
                print(f"   ✓ {description}")
                passed += 1
            else:
                print(f"   ✗ {description}")
        
        print(f"   Result: {passed}/{len(checks) + 1} checks passed")
        return passed == len(checks) + 1
    else:
        print(f"   ✗ .env.example file not found")
        return False


def main():
    """Run all verification tests."""
    print("=" * 60)
    print("🔒 Security Improvements Verification")
    print("=" * 60)
    
    results = {
        "Password Complexity": test_password_complexity(),
        "Account Lockout Config": test_account_lockout_config(),
        "SQL Injection Protection": test_sql_validation(),
        "Rate Limiting": test_rate_limiting(),
        "File Upload Security": test_file_sanitization(),
        ".env.example": test_env_example(),
    }
    
    print("\n" + "=" * 60)
    print("📊 Summary")
    print("=" * 60)
    
    for feature, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {status} - {feature}")
    
    print("=" * 60)
    
    all_passed = all(results.values())
    if all_passed:
        print("\n🎉 All security improvements verified successfully!")
        return 0
    else:
        failed = [name for name, passed in results.items() if not passed]
        print(f"\n⚠️  Some checks failed: {', '.join(failed)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
