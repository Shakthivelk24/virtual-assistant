<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Trivy Security Report</title>
<style>
body {
  font-family: Arial, sans-serif;
  margin: 20px;
}
h1 {
  color: #2c3e50;
}
h2 {
  margin-top: 30px;
  border-bottom: 2px solid #ddd;
  padding-bottom: 5px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
.severity-CRITICAL { color: white; background-color: #c0392b; font-weight: bold; }
.severity-HIGH { color: white; background-color: #e67e22; font-weight: bold; }
.severity-MEDIUM { background-color: #f1c40f; }
.severity-LOW { background-color: #2ecc71; }
</style>
</head>
<body>

<h1>Trivy Security Report</h1>

{{ range . }}



<!-- ================= VULNERABILITIES ================= -->
{{ if .Vulnerabilities }}
<h1>Vulnerabilities</h1>
<h2>{{ .Target}}</h2>
<table>
<tr>
<th>Library</th>
<th>ID</th>
<th>Severity</th>
<th>Installed</th>
<th>Fixed</th>
<th>Title</th>
</tr>
{{ range .Vulnerabilities }}
<tr>
<td>{{ .PkgName }}</td>
<td>{{ .VulnerabilityID }}</td>
<td class="severity-{{ .Severity }}">{{ .Severity }}</td>
<td>{{ .InstalledVersion }}</td>
<td>{{ .FixedVersion }}</td>
<td>{{ .Title }}</td>
</tr>
{{ end }}
</table>
{{ end }}

<!-- ================= MISCONFIGURATIONS ================= -->
{{ if .Misconfigurations }}
<h1>Misconfigurations</h1>
<h2>{{ .Target }}</h2>
<table>
<tr>
<th>ID</th>
<th>Severity</th>
<th>Title</th>
<th>Description</th>
</tr>
{{ range .Misconfigurations }}
<tr>
<td>{{ .ID }}</td>
<td class="severity-{{ .Severity }}">{{ .Severity }}</td>
<td>{{ .Title }}</td>
<td>{{ .Description }}</td>
</tr>
{{ end }}
</table>
{{ end }}

<!-- ================= SECRETS ================= -->
{{ if .Secrets }}
<h1>Secrets</h1>
<h2>{{ .Target }}</h2>
<table>
<tr>
<th>File</th>
<th>Rule ID</th>
<th>Severity</th>
<th>Title</th>
<th>Category</th>
<th>Line</th>
</tr>

{{ $file := .Target }}
{{ range .Secrets }}
<tr>
<td>{{ $file }}</td>
<td>{{ .RuleID }}</td>
<td class="severity-{{ .Severity }}">{{ .Severity }}</td>
<td>{{ .Title }}</td>
<td>{{ .Category }}</td>
<td>{{ .StartLine }}</td>
</tr>
{{ end }}

</table>
{{ end }}

{{ end }}

</body>
</html>