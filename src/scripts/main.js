import _ from "lodash";
import mainStyles from "./../styles/main.css";

function Node(data = null, left = null, right = null) {
  return {
    data,
    left,
    right,
  };
}

function buildTree(array, start = 0, end = array.length - 1) {
  if (start > end) {
    return null;
  }
  let mid = Math.round(start + (end - start) / 2);
  let leftSubtree = buildTree(array, start, mid - 1);
  let rightSubtree = buildTree(array, mid + 1, end);

  return Node(array[mid], leftSubtree, rightSubtree);
}

function Tree(array) {
  array = _.sortBy(_.uniq(array));
  let root = buildTree(array);
  return { root };
}

// prettyPrint function is copied from TOP lesson
const prettyPrint = (node, prefix = "", isLeft = true) => {
  if (node.right !== null) {
    prettyPrint(node.right, `${prefix}${isLeft ? "│   " : "    "}`, false);
  }
  console.log(`${prefix}${isLeft ? "└── " : "┌── "}${node.data}`);
  if (node.left !== null) {
    prettyPrint(node.left, `${prefix}${isLeft ? "    " : "│   "}`, true);
  }
};

prettyPrint(Tree([1, 2, 3]).root);
