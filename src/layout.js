/**
 * Decides how resolved files are laid out on disk.
 */

function dirSegments(path) {
  const parts = String(path || '')
    .split('/')
    .filter(Boolean);
  parts.pop(); // file name
  return parts;
}

/**
 * Decides the task folder name and each file's relative sub-path.
 * Single file → no folder. Several files → the deepest folder they all share.
 */
export function layoutFiles(files, share) {
  if (files.length === 1) return { name: '', paths: [''] };
  const segmentLists = files.map((f) => dirSegments(f.path));
  let common = segmentLists[0].slice();
  for (const segs of segmentLists.slice(1)) {
    let i = 0;
    while (i < common.length && i < segs.length && common[i] === segs[i]) i++;
    common = common.slice(0, i);
    if (!common.length) break;
  }
  const folder = common.length
    ? common[common.length - 1]
    : share.title && !/\./.test(share.title)
      ? share.title
      : `TeraBox_${share.surl}`;
  const paths = segmentLists.map((segs) => segs.slice(common.length).join('/'));
  return { name: folder, paths };
}
