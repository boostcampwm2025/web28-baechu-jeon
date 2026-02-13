import { PrismLight } from "react-syntax-highlighter";
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import java from "react-syntax-highlighter/dist/esm/languages/prism/java";
import c from "react-syntax-highlighter/dist/esm/languages/prism/c";
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp";
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp";
import go from "react-syntax-highlighter/dist/esm/languages/prism/go";
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust";
import kotlin from "react-syntax-highlighter/dist/esm/languages/prism/kotlin";
import swift from "react-syntax-highlighter/dist/esm/languages/prism/swift";
import dart from "react-syntax-highlighter/dist/esm/languages/prism/dart";
import ruby from "react-syntax-highlighter/dist/esm/languages/prism/ruby";
import php from "react-syntax-highlighter/dist/esm/languages/prism/php";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash";
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker";
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown";

const languages: Record<string, unknown> = {
  javascript,
  js: javascript,
  typescript,
  ts: typescript,
  tsx,
  jsx,
  python,
  py: python,
  java,
  c,
  cpp,
  csharp,
  cs: csharp,
  go,
  rust,
  rs: rust,
  kotlin,
  kt: kotlin,
  swift,
  dart,
  ruby,
  rb: ruby,
  php,
  css,
  json,
  bash,
  sh: bash,
  shell: bash,
  yaml,
  yml: yaml,
  sql,
  docker,
  dockerfile: docker,
  markdown,
  md: markdown,
};

for (const [name, lang] of Object.entries(languages)) {
  PrismLight.registerLanguage(name, lang);
}

export { PrismLight as SyntaxHighlighter };
