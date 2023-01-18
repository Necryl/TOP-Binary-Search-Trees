/* eslint-disable no-console */
import _ from "lodash";
// eslint-disable-next-line no-unused-vars
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
  const mid = Math.round(start + (end - start) / 2);
  const leftSubtree = buildTree(array, start, mid - 1);
  const rightSubtree = buildTree(array, mid + 1, end);

  return Node(array[mid], leftSubtree, rightSubtree);
}

function Tree(array) {
  array = _.sortBy(_.uniq(array));
  const root = buildTree(array);

  function find(
    value,
    mode = "default",
    backtrack = 0,
    node = this.root,
    predecessors = [],
    getPrede = (attempt) => {
      const limit = predecessors.length - 1;
      if (attempt < 0) {
        return predecessors[0];
      } else if (attempt > limit) {
        return predecessors[limit];
      }
      return predecessors[attempt];
    }
  ) {
    if (predecessors.length < backtrack + 2) {
      predecessors.unshift(node);
    } else if (predecessors.length === backtrack + 2) {
      predecessors.pop();
      predecessors.unshift(node);
    }
    if (node === null) {
      return mode === "leaf" ? getPrede(backtrack + 1) : getPrede(backtrack);
    }
    if (node.data === value) {
      return getPrede(backtrack);
    }
    let result;
    if (value < node.data) {
      result = find(value, mode, backtrack, node.left, predecessors);
    } else {
      result = find(value, mode, backtrack, node.right, predecessors);
    }
    return result;
  }

  // eslint-disable-next-line consistent-return
  function insert(value) {
    const leaf = this.find(value, "leaf");
    if (leaf.data === value) {
      return Error("value already exists in tree");
    }
    if (leaf.data > value) {
      if (leaf.left !== null) {
        return Error("The leaf node's left pointer is NOT null", leaf);
      }
      leaf.left = Node(value);
    } else {
      if (leaf.right !== null) {
        return Error("The leaf node's right pointer is NOT null", leaf);
      }
      leaf.right = Node(value);
    }
  }

  function remove(value) {
    const parent = this.find(value, "default", 1);
    const node = this.find(value, "default", 0, parent);
    const isRoot = node === parent;
    if (node === null) {
      throw Error("Couldn't find a node with the given value");
    }
    if (node.left === null || node.right === null) {
      if (node.left === node.right) {
        if (isRoot) {
          this.root = null;
        } else if (parent.left === node) {
          parent.left = null;
        } else {
          parent.right = null;
        }
      } else {
        const replacer = node.left === null ? node.right : node.left;
        node.data = replacer.data;
        node.left = replacer.left;
        node.right = replacer.right;
      }
    } else {
      let dataArray = [];
      this.levelOrder(
        (elem) => {
          dataArray.push(elem.data);
        },
        [node]
      );
      dataArray.shift();
      dataArray = _.sortBy(dataArray);
      const replacer = buildTree(dataArray);
      if (isRoot) {
        node.data = replacer.data;
        node.left = replacer.left;
        node.right = replacer.right;
      } else if (parent.left === node) {
        parent.left = replacer;
      } else {
        parent.right = replacer;
      }
    }
  }

  function levelOrder(func = "default", queue = [this.root], results = []) {
    if (func === "default") {
      func = (elem) => elem.data;
    }
    const current = queue.shift();
    results.push(func(current));
    [current.left, current.right].forEach((subTree) => {
      if (subTree !== null) {
        queue.push(subTree);
      }
    });
    if (queue.length !== 0) {
      results = levelOrder(func, queue, results);
    }
    return results;
  }

  function depthFirst(
    order = ["data", "left", "right"],
    func = "default",
    node = this.root,
    results = []
  ) {
    if (func === "default") {
      func = (elem) => elem.data;
    }

    const process = {
      data: () => {
        if (node !== null) {
          results.push(func(node));
        }
      },
      left: () => {
        if (node.left !== null) {
          results = depthFirst(order, func, node.left, results);
        }
      },
      right: () => {
        if (node.right !== null) {
          results = depthFirst(order, func, node.right, results);
        }
      },
    };

    order.forEach((instruction) => {
      process[instruction]();
    });

    return results;
  }
  function inorder(func = "default", node = this.root) {
    return depthFirst(["left", "data", "right"], func, node);
  }
  function preorder(func = "default", node = this.root) {
    return depthFirst(["data", "left", "right"], func, node);
  }
  function postorder(func = "default", node = this.root) {
    return depthFirst(["left", "right", "data"], func, node);
  }

  function height(node) {
    if (node.left === null && node.right === null) {
      return 0;
    }
    const heights = [];
    if (node.left !== null) {
      heights.push(1 + height(node.left));
    }
    if (node.right !== null) {
      heights.push(1 + height(node.right));
    }

    return heights.reduce((final, current) => {
      if (current > final) {
        final = current;
      }
      return final;
    }, 0);
  }

  function depth(node, base = this.root, counter = 0) {
    if (base === node) {
      return counter;
    }
    if (base.data > node.data && base.left !== null) {
      return depth(node, base.left, counter + 1);
    } else if (base.data < node.data && base.right !== null) {
      return depth(node, base.right, counter + 1);
    }
    throw Error("Couldn't find the specified node");
  }
  function isBalanced(rootNode = this.root) {
    const diffs = inorder((elem) => {
      const leftHeight = elem.left === null ? 0 : height(elem.left);
      const rightHeight = elem.right === null ? 0 : height(elem.right);

      let diff = leftHeight - rightHeight;
      if (diff < 0) {
        diff *= -1;
      }
      if (diff > 1) {
        return false;
      }
      return true;
    }, rootNode);
    return !diffs.includes(false);
  }
  function rebalance() {
    if (isBalanced(this.root) === false) {
      this.root = buildTree(_.sortBy(inorder("default", this.root)));
    } else {
      throw Error("Tree is already balanced");
    }
  }

  return {
    root,
    insert,
    find,
    remove,
    levelOrder,
    depthFirst,
    inorder,
    preorder,
    postorder,
    height,
    depth,
    isBalanced,
    rebalance,
  };
}

function randomNumArray(
  length = 10,
  rangeStart = 0,
  rangeEnd = 20,
  noDuplicates = true
) {
  function getRandomNum() {
    return Math.floor(Math.random() * (rangeEnd - rangeStart)) + rangeStart;
  }
  const result = [];
  for (let i = 0; i < length; i++) {
    let num = getRandomNum();
    if (noDuplicates) {
      while (result.includes(num)) {
        num = getRandomNum();
      }
    }
    result.push(num);
  }
  return result;
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

// Tie it all together
const binarySearchTree = Tree(randomNumArray(10));
console.log("Created a binary search tree with an array of random numbers");
prettyPrint(binarySearchTree.root);
console.log("Checking if tree is balanced:", binarySearchTree.isBalanced());
console.log(
  "Printing out the tree in level order:",
  binarySearchTree.levelOrder()
);
console.log("Printing out the tree in pre order:", binarySearchTree.preorder());
console.log(
  "Printing out the tree in post order:",
  binarySearchTree.postorder()
);
console.log("Printing out the tree in in order:", binarySearchTree.inorder());
randomNumArray(5, 100, 150).forEach((num) => {
  binarySearchTree.insert(num);
});
console.log("Unbalancing the tree by adding some big numbers");
prettyPrint(binarySearchTree.root);
console.log(
  "Checking if the tree is unbalanced ( formalities :/ ) ->",
  binarySearchTree.isBalanced()
);
console.log("Balancing the tree again!");
binarySearchTree.rebalance();
prettyPrint(binarySearchTree.root);
console.log(
  "Confirming that the tree is balanced:",
  binarySearchTree.isBalanced()
);
console.log(
  "Printing out the tree in level order:",
  binarySearchTree.levelOrder()
);
console.log("Printing out the tree in pre order:", binarySearchTree.preorder());
console.log(
  "Printing out the tree in post order:",
  binarySearchTree.postorder()
);
console.log("Printing out the tree in in order:", binarySearchTree.inorder());
randomNumArray(5, 100, 150).forEach((num) => {
  binarySearchTree.insert(num);
});
