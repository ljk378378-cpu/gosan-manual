import markdown
import os

input_file = "주민이그린고산_전체원고_합본작업본.md"
output_file = "주민이그린고산_전체원고_합본작업본.html"

with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

html_body = markdown.markdown(text, extensions=["tables", "nl2br"])

html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<style>
  body {{
    font-family: "맑은 고딕", "Malgun Gothic", "나눔고딕", sans-serif;
    font-size: 11pt;
    line-height: 1.8;
    max-width: 900px;
    margin: 40px auto;
    padding: 0 20px;
    color: #111;
  }}
  h1 {{ font-size: 20pt; margin-top: 2em; border-bottom: 2px solid #333; padding-bottom: 6px; }}
  h2 {{ font-size: 15pt; margin-top: 1.8em; }}
  h3 {{ font-size: 13pt; margin-top: 1.4em; }}
  h4 {{ font-size: 11pt; margin-top: 1.2em; }}
  table {{
    border-collapse: collapse;
    width: 100%;
    margin: 1em 0;
    font-size: 10.5pt;
  }}
  th, td {{
    border: 1px solid #888;
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
  }}
  th {{ font-weight: bold; }}

  p {{ margin: 0.6em 0; }}
  ul, ol {{ margin: 0.5em 0; padding-left: 1.6em; }}
  li {{ margin: 0.3em 0; }}
  hr {{ border: none; border-top: 1px solid #ccc; margin: 2em 0; }}
  strong {{ font-weight: bold; }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

with open(output_file, "w", encoding="utf-8") as f:
    f.write(html)

print(f"완료: {output_file}")
print(f"파일 위치: {os.path.abspath(output_file)}")
