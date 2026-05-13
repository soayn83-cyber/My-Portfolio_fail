const fs = require('fs');
const file = 'C:/Users/KUMA_LAB/Documents/soayhyeon05/frontend/components/admin/posts-manager.tsx';
let data = fs.readFileSync(file, 'utf8');

const targetStr1 = \      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop() || "png"\;

const replaceStr1 = \      for (const file of Array.from(files)) {
        // 50MB 제한 체크
        const MAX_SIZE = 50 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
          throw new Error(\\\파일 (\)의 크기가 50MB를 초과합니다. (현재: \MB)\\\);
        }
        
        const fileExt = file.name.split('.').pop() || "png"\;

// Replace in both handleUpload and handleEpisodeImageUpload
let success = false;
if (data.includes(targetStr1)) {
  data = data.replaceAll(targetStr1, replaceStr1);
  fs.writeFileSync(file, data, 'utf8');
  success = true;
}

console.log(success ? 'Updated size limit checks!' : 'Failed finding string');
