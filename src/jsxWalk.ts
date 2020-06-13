export function jsxWalk(
    vNode: preact.VNode,
    callback: (vNode: preact.ComponentChild, parents: preact.VNode[]) => preact.ComponentChild,
    parents: preact.VNode[] = [],
): preact.VNode {
    let childParents = [vNode].concat(parents);
    let children = vNode.props.children;
    if(Array.isArray(children)) {
        for(let i = 0; i < children.length; i++) {
            children[i] = callback(children[i], parents);
            let child = children[i];
            if(child && typeof child === "object" && "type" in child) {
                jsxWalk(child, callback, childParents);
            }
        }
    } else {
        vNode.props.children = callback(children, parents);
        let child = vNode.props.children;
        if(child && typeof child === "object" && "type" in child) {
            jsxWalk(child, callback, childParents);
        }
    }
    return vNode;
}