import random
from datetime import datetime
from ehr_db import get_all_vulnerabilities


class AIAnalyzer:
    @staticmethod
    def analyze_crash(crash_data: dict):
        """
        Analyzes a crash event detected by the FuzzEngine.
        Maps the crash type to a specific vulnerability in the EHR vulnerability registry.
        Returns a detailed report with exploitation payload and remediation guidance.
        """
        vulnerabilities = get_all_vulnerabilities()

        # If the crash_data specifies a vulnerability index, use it.
        # Otherwise pick one randomly (simulates AI classification)
        vuln_index = crash_data.get("vuln_index", random.randint(0, len(vulnerabilities) - 1))
        vuln = vulnerabilities[vuln_index]

        return {
            "id": vuln["id"],
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "target": vuln["target"],
            "type": vuln["type"],
            "cwe": vuln["cwe"],
            "severity": vuln["severity"],
            "exploitability": vuln["exploitability"],
            "root_cause": vuln["description"],
            "recommendation": vuln["remediation"],
            "compliance_impact": vuln["compliance_impact"],
            "patient_safety": vuln["patient_safety"],
            "exploitation_payload": vuln["exploitation_payload"],
            "exploitation_explanation": vuln["exploitation_explanation"],
        }

    @staticmethod
    def analyze_all():
        """Returns all known vulnerabilities as a full sweep report."""
        vulns = get_all_vulnerabilities()
        return [
            {
                "id": v["id"],
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "target": v["target"],
                "type": v["type"],
                "cwe": v["cwe"],
                "severity": v["severity"],
                "exploitability": v["exploitability"],
                "root_cause": v["description"],
                "recommendation": v["remediation"],
                "compliance_impact": v["compliance_impact"],
                "patient_safety": v["patient_safety"],
                "exploitation_payload": v["exploitation_payload"],
                "exploitation_explanation": v["exploitation_explanation"],
            }
            for v in vulns
        ]


analyzer = AIAnalyzer()
