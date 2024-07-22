// src/utils.js
/**
 * @param {any[]} folders
 * @param {number[]} indexArray
 * @param {any} item
 */
export function moveItem(folders, indexArray, item) {
  let currentLevel = folders;
  let index = 0;
  for (let i = 0; i < indexArray.length - 1; i++) {
    currentLevel = currentLevel[indexArray[i]].subfolders;
  }

  console.log(index, indexArray[indexArray.length - 1]);
  if (!currentLevel[indexArray[indexArray.length - 1]].subfolders)
    currentLevel[indexArray[indexArray.length - 1]].subfolders = [];
  currentLevel[indexArray[indexArray.length - 1]].subfolders.push(item);

  return folders;
}
/**
 * @param {any[]} folders
 * @param {number[]} indexArray
 * @param {any} item
 */
export function removeItem(folders, indexArray, item) {
  let currentLevel = folders;
  for (let i = 0; i < indexArray.length - 1; i++) {
    currentLevel = currentLevel[indexArray[i]].subfolders;
  }
  currentLevel.splice(indexArray[indexArray.length - 1], 1);

  return folders;
}

/**
 * @param {any[]} folders
 * @param {any} path
 * @param {any} [draggedItemPath]
 */
export function moveItemInHierarchy(folders, path, draggedItemPath) {
  let fl_path = findFolderPath(folders, path);
  console.log(fl_path);
  // moveItem(folders, fl_path, draggedItemPath);

  let fl_path2 = findFolderPath(folders, draggedItemPath);

  console.log(fl_path2);
  folders = moveItem(folders, fl_path, draggedItemPath);

  return removeItem(folders, fl_path2, draggedItemPath);
}

/**
 * Find the path of a folder from the root level
 * @param {any[]} folders - The array of folders
 * @param {any} targetFolder - The folder to find
 * @param {number[]} path - The current path (initially empty)
 * @returns {number[]} - The path to the target folder
 */
function findFolderPath(folders, targetFolder, path = []) {
  let index = -1;
  for (let folder of folders) {
    index = index + 1;
    if (folder === targetFolder) {
      return [...path, index];
    }
    if (folder.subfolders) {
      let subPath = findFolderPath(folder.subfolders, targetFolder, [
        ...path,
        index,
      ]);
      if (subPath) {
        return subPath;
      }
    }
  }
  // @ts-ignore
  return null; // Folder not found
}

/**
 * @param {any[]} folder
 */
export function removeIfFileNameisEmpty(folder) {
  if (folder == null) return null;
  for (let index = 0; index < folder.length; index++) {
    const element = folder[index];
    if (element.name === "" && element.rename == false) {
      folder.splice(index, 1);
    } else if (element["remove"] == true) {
      folder.splice(index, 1);
    } else {
      removeIfFileNameisEmpty(element.subfolders);
    }
  }
}
