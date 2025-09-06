import React from "react";
import ReactMarkdown from "react-markdown";
import "./Markdown.css";
import { convertHTMLToContent } from "@/utils/format";
function LinkRenderer(props: any) {
    return (
        <a href={props.href} target="_blank" rel="noreferrer">
            {props.children}
        </a>
    );
}

type MarkDownProps = { instructions?: string };

const MarkDown: React.FC<MarkDownProps> = ({ instructions }) => {
    return (
        <div id="markdown">
            <ReactMarkdown components={{ a: LinkRenderer }}>
                {instructions ? convertHTMLToContent(instructions) || "" : ""}
            </ReactMarkdown>
        </div>
    );
};

export default MarkDown;
