"""Derive graph.json (topics -> concepts -> widgets, prerequisite + related edges) from the registry and
the per-widget explain.js files. Nothing in the graph is hand-maintained (decision D8).

Usage: python tools/build-graph.py [--check]     (--check: validate only, write nothing)
Exit 1 on: unparsable explain.js, missing language or required section, link to an unknown widget id.
Pure stdlib.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REG = json.loads((ROOT / "widgets" / "registry.json").read_text(encoding="utf-8"))
LANGS = REG["vocabulary"]["languages"]
REQUIRED = ("summary", "concept", "how_to_use")
SPAN = re.compile(r"/\*\s*JSON-START\s*\*/(.*?)/\*\s*JSON-END\s*\*/", re.S)


def load_explain(wid: str):
    path = ROOT / "widgets" / wid / "explain.js"
    if not path.exists():
        return None, f"{wid}: no explain.js"
    m = SPAN.search(path.read_text(encoding="utf-8"))
    if not m:
        return None, f"{wid}: explain.js has no JSON-START/JSON-END span"
    try:
        data = json.loads(m.group(1))
    except json.JSONDecodeError as e:
        return None, f"{wid}: explain.js JSON does not parse: {e}"
    errs = []
    if data.get("id") != wid:
        errs.append(f"{wid}: explain id is {data.get('id')!r}")
    for lang in LANGS:
        if lang not in data:
            errs.append(f"{wid}: explain lacks language {lang}")
            continue
        for key in REQUIRED:
            if not data[lang].get(key):
                errs.append(f"{wid}: explain.{lang} lacks {key}")
    return data, errs


def main():
    check = "--check" in sys.argv
    ids = {w["id"] for w in REG["widgets"]}
    nodes, edges, errors, warnings = [], [], [], []
    for t in REG["vocabulary"]["topics"]:
        nodes.append({"id": f"topic:{t}", "kind": "topic", "label": t})
    concepts = {}
    for w in REG["widgets"]:
        c = w["concept"]
        if c not in concepts:
            concepts[c] = {"id": f"concept:{c}", "kind": "concept", "label": c, "topic": w["topic"]}
            edges.append({"from": f"topic:{w['topic']}", "to": f"concept:{c}", "kind": "has-concept"})
        node = {"id": w["id"], "kind": "widget", "label": w["title_i18n"], "concept": c, "topic": w["topic"],
                "domains": w["domains"], "difficulty": w["difficulty"], "status": w.get("status", "published"),
                "version": w["version"], "explain": False}
        edges.append({"from": f"concept:{c}", "to": w["id"], "kind": "has-widget"})
        for p in w.get("prerequisites", []):
            edges.append({"from": p, "to": w["id"], "kind": "prerequisite"})
        if w.get("status", "published") == "published":
            data, errs = load_explain(w["id"])
            if data is None:
                warnings.append(errs)
            else:
                errors.extend(errs)
                node["explain"] = True
                node["explain_version"] = data.get("version")
                if data.get("concept") and data["concept"] != c:
                    warnings.append(f"{w['id']}: explain concept {data['concept']!r} != registry concept {c!r}")
                seen = set()
                for lang in LANGS:
                    for link in (data.get(lang) or {}).get("links", []):
                        tid = link.get("id")
                        if tid not in ids:
                            errors.append(f"{w['id']}: explain.{lang} links to unknown widget {tid!r}")
                        elif tid not in seen:
                            seen.add(tid)
                            edges.append({"from": w["id"], "to": tid, "kind": "related"})
        nodes.append(node)
    nodes[len(REG["vocabulary"]["topics"]):len(REG["vocabulary"]["topics"])] = list(concepts.values())
    for wmsg in warnings:
        print(f"warning: {wmsg}")
    if errors:
        for e in errors:
            print(f"error: {e}")
        sys.exit(1)
    graph = {"schema_version": "1.0.0", "generated_from": ["widgets/registry.json", "widgets/*/explain.js"],
             "nodes": nodes, "edges": edges}
    if not check:
        (ROOT / "graph.json").write_text(json.dumps(graph, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    kinds = {}
    for e in edges:
        kinds[e["kind"]] = kinds.get(e["kind"], 0) + 1
    print(f"ok: {len(nodes)} nodes, {len(edges)} edges {kinds}{' (check only)' if check else ' -> graph.json'}")


if __name__ == "__main__":
    main()
