
const INITIAL_FS = {
  id: 'root',
  name: 'My Computer',
  type: 'root',
  children: [
    {
      id: 'c-drive',
      name: 'Local Disk (C:)',
      type: 'drive',
      children: [
        {
          id: 'windows',
          name: 'WINDOWS',
          type: 'folder',
          children: [
            { id: 'system32', name: 'System32', type: 'folder', children: [] },
            { id: 'web', name: 'Web', type: 'folder', children: [] }
          ]
        },
        {
          id: 'documents',
          name: 'My Documents',
          type: 'folder',
          children: [
            { id: 'readme', name: 'readme.txt', type: 'file', content: 'Welcome to Windows XP!\n\nThis is a simulation of the classic OS.\nYou can now create files and folders.' }
          ]
        },
        {
          id: 'desktop',
          name: 'Desktop',
          type: 'folder',
          children: []
        },
        {
          id: 'recycle-bin',
          name: 'Recycle Bin',
          type: 'folder',
          children: []
        }
      ]
    }
  ]
};

export const getFileSystem = () => {
  const saved = localStorage.getItem('xp_fs');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Basic validation: ensure desktop and recycle bin exist
      if (findNodeById(parsed.children, 'desktop') && findNodeById(parsed.children, 'recycle-bin')) {
        return parsed;
      }
    } catch (e) {
      return INITIAL_FS;
    }
  }
  return INITIAL_FS;
};

export const saveFileSystem = (fs) => {
  localStorage.setItem('xp_fs', JSON.stringify(fs));
};

export const findNodeById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNodeById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

export const updateNodeInTree = (nodes, id, updateFn) => {
  return nodes.map(node => {
    if (node.id === id) {
      return updateFn(node);
    }
    if (node.children) {
      return { ...node, children: updateNodeInTree(node.children, id, updateFn) };
    }
    return node;
  });
};

export const addNodeToParent = (fs, parentId, newNode) => {
  const updatedFs = {
    ...fs,
    children: updateNodeInTree(fs.children, parentId, (parent) => ({
      ...parent,
      children: [...(parent.children || []), newNode]
    }))
  };
  saveFileSystem(updatedFs);
  return updatedFs;
};

export const deleteNode = (fs, id) => {
  const removeNode = (nodes) => {
    return nodes.filter(node => node.id !== id).map(node => ({
      ...node,
      children: node.children ? removeNode(node.children) : undefined
    }));
  };
  const updatedFs = { ...fs, children: removeNode(fs.children) };
  saveFileSystem(updatedFs);
  return updatedFs;
};
export const moveToTrash = (fs, id) => {
  const nodeToTrash = findNodeById(fs.children, id);
  if (!nodeToTrash || id === 'recycle-bin' || id === 'c-drive' || id === 'windows') return fs;

  // 1. Remove from current location
  const updatedFsAfterRemoval = deleteNode(fs, id);

  // 2. Add to recycle bin
  const finalFs = addNodeToParent(updatedFsAfterRemoval, 'recycle-bin', nodeToTrash);
  return finalFs;
};

export const emptyTrash = (fs) => {
  const updatedFs = {
    ...fs,
    children: updateNodeInTree(fs.children, 'recycle-bin', (bin) => ({
      ...bin,
      children: []
    }))
  };
  saveFileSystem(updatedFs);
  return updatedFs;
};
