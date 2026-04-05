/* =============================================
   娟娟專區 數位整理大全 (整合版)
   功能：1. 重複檔案檢查 2. 深度命名(日期+地點) 3. 基礎分類搬移
   ============================================= */

var G_ROOT_ID = "1CXIlgBHKnGSqMF2Go9ur6PpRfXMDlOYY";

function getSubFolder(root, key) {
  var folders = root.getFolders();
  while (folders.hasNext()) {
    var f = folders.next();
    if (f.getName().indexOf(key) !== -1) return f;
  }
  return null;
}

function duplicate_cleaner() {
  var root = DriveApp.getFolderById(G_ROOT_ID);
  var album = getSubFolder(root, "01");
  var archiveRoot = getSubFolder(root, "09");
  
  if (!album || !archiveRoot) return;

  var trashFolder;
  var existingTrash = archiveRoot.getFoldersByName("重複檔案暫存區");
  if (existingTrash.hasNext()) { trashFolder = existingTrash.next(); }
  else { trashFolder = archiveRoot.createFolder("重複檔案暫存區"); }

  var files = album.getFiles();
  var fileMap = {}; 
  var count = 0;

  while (files.hasNext()) {
    try {
      var file = files.next();
      var checksum = Drive.Files.get(file.getId()).md5Checksum;
      if (fileMap[checksum]) {
        file.moveTo(trashFolder);
        count++;
      } else {
        fileMap[checksum] = true;
      }
    } catch(e) { }
  }
  Logger.log("已移除重複: " + count);
}

function photo_depth_sorter() {
  var root = DriveApp.getFolderById(G_ROOT_ID);
  var album = getSubFolder(root, "01");
  if (!album) return;
  
  var files = album.getFiles();
  var count = 0;
  while (files.hasNext() && count < 30) {
    try {
      var file = files.next();
      var oldName = file.getName();
      if (oldName.match(/^\d{8}/)) continue;

      var info = Drive.Files.get(file.getId(), {fields: "imageMediaMetadata"}).imageMediaMetadata;
      var dateStr = Utilities.formatDate(file.getDateCreated(), "GMT+8", "yyyyMMdd");
      var locStr = "";

      if (info) {
        if (info.time) dateStr = info.time.replace(/[: ]/g, "").substring(0, 8);
        if (info.location && info.location.latitude) {
          var res = Maps.newGeocoder().reverseGeocode(info.location.latitude, info.location.longitude);
          if (res.results && res.results[0]) {
            var comps = res.results[0].address_components;
            for (var i=0; i<comps.length; i++) {
              if (comps[i].types.includes("locality") || comps[i].types.includes("administrative_area_level_1")) {
                locStr = "_" + comps[i].long_name; break;
              }
            }
          }
        }
      }
      file.setName(dateStr + locStr + "_" + oldName);
      count++;
    } catch(e) { }
  }
}

function smart_sorter() {
  var root = DriveApp.getFolderById(G_ROOT_ID);
  var folders = root.getFolders();
  var fMap = {};
  while (folders.hasNext()) { 
    var f = folders.next(); 
    fMap[f.getName().split('_')[0]] = f; 
  }

  var files = root.getFiles();
  var count = 0;
  while (files.hasNext() && count < 100) {
    try {
      var file = files.next();
      var oldN = file.getName();
      var ext = oldN.split('.').pop().toLowerCase();
      var target = fMap["10"]; var cat = "待分類";

      if (["jpg","jpeg","png","mp4","mov","heic"].includes(ext)) {
        target = fMap["01"]; cat = "個人相簿";
      } else if (["pdf","doc","docx","xlsx"].includes(ext)) {
        target = fMap["05"]; cat = "文件學習";
      }

      file.setName(Utilities.formatDate(file.getDateCreated(),"GMT+8","yyyyMMdd") + "_" + cat + "_" + oldN);
      file.moveTo(target);
      count++;
    } catch(e) { }
  }
}
