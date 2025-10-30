// 初始化LeanCloud（替换成你的App ID和App Key）
AV.init({
  appId: "cVypwHIg9srBsu26qVCVVNjl-gzGzoHsz",
  appKey: "kE1o0ixRy6RlyqpMu3qnFJDc",
  serverURL: "https://cvypwhig.lc-cn-n1-shared.com" // 从LeanCloud的「应用 Keys」中复制「服务器地址」
});
/* ============================================
   Hello Kitty 十年友谊回忆相册 - 交互脚本
   包含照片放大、音乐播放、留言等功能
   ============================================ */

// ========== 页面加载完成后初始化 ==========
document.addEventListener('DOMContentLoaded', function() {
    loadMessages();
    setupAutoMusic();
    setupPhotoModal();
    animateStickers();
    randomizeStickerPositions();
});

// ***** 背景音乐播放优化 *****
let autoMusicPlayed = false;
let autoMusicPausedByUser = false;
function setupAutoMusic() {
  const autoMusicTrigger = document.getElementById('autoMusicTrigger');
  const autoMusic = document.getElementById('autoMusic');
  if (!autoMusicTrigger || !autoMusic) return;
  autoMusicTrigger.addEventListener('click', function() {
    if (!autoMusicPlayed) {
      autoMusic.play().then(() => {
        showNotification('🎵 已开启背景音乐～');
        autoMusicPlayed = true;
        autoMusicPausedByUser = false;
        autoMusicTrigger.textContent = '⏸️ 暂停背景音乐';
        autoMusicTrigger.style.opacity = '0.7';
      }).catch(error => {
        console.error('背景音乐播放失败:', error);
        showNotification('❌ 音频无法播放：本地文件/浏览器策略或路径错误！');
      });
    } else {
      if (autoMusic.paused) {
        autoMusic.play().then(()=>{
          showNotification('🎵 背景音乐继续播放');
          autoMusicPausedByUser = false;
          autoMusicTrigger.textContent = '⏸️ 暂停背景音乐';
        }).catch(error=>{
          showNotification('❌ 音乐播放失败，请检查路径/格式');
        });
      } else {
        autoMusic.pause();
        showNotification('⏸️ 已暂停背景音乐');
        autoMusicPausedByUser = true;
        autoMusicTrigger.textContent = '▶️ 播放背景音乐';
      }
    }
  });
  autoMusic.addEventListener('ended',function(){
    autoMusicPlayed=false; autoMusicPausedByUser=false;
    autoMusicTrigger.textContent='🔔 点击开始背景音乐';
    autoMusicTrigger.style.opacity = '1';
  });
}
// 支持 M 键快捷键全局切音乐
window.addEventListener('keydown',function(e){
  if(e.key.toLowerCase()==='m' && !e.ctrlKey && !e.altKey) {
    const autoMusic = document.getElementById('autoMusic');
    if(autoMusic) {
      if(autoMusic.paused){ autoMusic.play(); showNotification('🎵 背景音乐继续播放'); }
      else { autoMusic.pause(); showNotification('⏸️ 背景音乐暂停'); }
    }
  }
});
// ***** 其他功能代码不动 *****

// ========== 点击播放音乐 ==========
function playMusic() {
    const clickMusic = document.getElementById('clickMusic');
    
    clickMusic.play().then(() => {
        showNotification('🎵 正在播放：我们的专属BGM');
    }).catch(error => {
        console.error('播放失败:', error);
        showNotification('❌ 播放出错，请检查音频文件');
    });
}

// ========== 照片模态框功能 ==========
let currentPhotoModal = null;

function setupPhotoModal() {
    // 点击模态框背景关闭
    const modal = document.getElementById('photoModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closePhotoModal();
        }
    });
    
    // 点击关闭按钮
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', function(e) {
        e.stopPropagation();
        closePhotoModal();
    });
    
    // ESC键关闭
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            closePhotoModal();
        }
    });
}

function openPhotoModal(photoSrc) {
    const modal = document.getElementById('photoModal');
    const modalImage = document.getElementById('modalImage');
    
    modalImage.src = photoSrc;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // 防止背景滚动
    currentPhotoModal = modal;
    
    // 添加淡入动画
    modal.style.opacity = '0';
    setTimeout(() => {
        modal.style.transition = 'opacity 0.3s ease';
        modal.style.opacity = '1';
    }, 10);
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// ========== 视频播放功能 ==========
function playVideo(videoElement) {
    const container = videoElement.parentElement;
    const playButton = container.querySelector('.play-button');
    
    // 如果有视频源，播放视频
    if (videoElement.src) {
        if (videoElement.paused) {
            videoElement.play();
            playButton.style.display = 'none';
            
            // 视频结束时显示播放按钮
            videoElement.onended = function() {
                playButton.style.display = 'flex';
            };
        } else {
            videoElement.pause();
            playButton.style.display = 'flex';
        }
    } else {
        // 没有视频源时的提示
        showNotification('💕 视频文件尚未替换，请根据注释添加视频路径');
    }
}

// ========== 留言功能 ==========
// 替换原有的submitMessage函数
function submitMessage() {
    const authorInput = document.getElementById('messageAuthor');
    const contentInput = document.getElementById('messageContent');
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!author) {
        showNotification('💝 请输入你的名字哦～');
        return;
    }
    
    if (!content) {
        showNotification('💝 请输入留言内容哦～');
        return;
    }
    
    // 创建留言对象
    const message = {
        author: author,
        text: content,
        timestamp: new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    // 保存到localStorage
    let messages = JSON.parse(localStorage.getItem('friendshipMessages') || '[]');
    messages.push(message);
    localStorage.setItem('friendshipMessages', JSON.stringify(messages));
    
    // 显示新留言
    displayMessage(message);
    
    // 清空输入框
    authorInput.value = '';
    contentInput.value = '';
    
    // 提示
    showNotification('💌 留言已保存～');
}

// 同时修改displayMessage函数
function displayMessage(message) {
    const container = document.getElementById('messagesContainer');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-card';  // 使用已定义的样式类
    messageDiv.innerHTML = `
        <div class="message-author">${escapeHtml(message.author)}</div>
        <div class="message-time">${message.timestamp}</div>
        <div class="message-text">${escapeHtml(message.text)}</div>
    `;
    
    container.appendChild(messageDiv);
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
}

function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('friendshipMessages') || '[]');
    const container = document.getElementById('messagesContainer');
    
    messages.forEach(message => {
        displayMessage(message);
    });
    
    // 如果没有留言，显示提示
    if (messages.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; font-size: 1.1em;">暂无留言，快来写下想对30岁的我们说的话吧～</p>';
    }
}

// HTML转义函数（防止XSS攻击）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 清除所有留言（可选功能）
function clearAllMessages() {
    if (confirm('确定要清除所有留言吗？')) {
        localStorage.removeItem('friendshipMessages');
        location.reload();
    }
}

// ========== 表情包动画 ==========
function animateStickers() {
    const stickers = document.querySelectorAll('.sticker');
    
    // 为每个表情包添加随机浮动效果
    stickers.forEach((sticker, index) => {
        const delay = index * 0.3; // 错开动画时间
        const duration = 3 + Math.random() * 2; // 3-5秒随机周期
        
        sticker.style.animationDelay = delay + 's';
        sticker.style.animationDuration = duration + 's';
    });
    
    // 添加一些额外的动态效果
    createFloatingHearts();
}

// ========== 浮动爱心特效 ==========
function createFloatingHearts() {
    const heartSymbols = ['💕', '💖', '💗', '💓', '💝'];
    
    // 每3秒创建一个浮动的爱心
    setInterval(() => {
        if (Math.random() > 0.7) { // 30%概率出现
            const heart = document.createElement('div');
            heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            heart.style.position = 'fixed';
            heart.style.fontSize = '20px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '9999';
            heart.style.left = Math.random() * 100 + '%';
            heart.style.top = '100%';
            heart.style.animation = 'heartRise 5s ease-out forwards';
            
            document.body.appendChild(heart);
            
            // 5秒后移除
            setTimeout(() => {
                heart.remove();
            }, 5000);
        }
    }, 3000);
}

// ========== 通知提示 ==========
function showNotification(message) {
    // 移除旧的通知
    const oldNotification = document.querySelector('.custom-notification');
    if (oldNotification) {
        oldNotification.remove();
    }
    
    // 创建新通知
    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #FF69B4, #FF1493);
        color: white;
        padding: 20px 40px;
        border-radius: 30px;
        font-size: 1.2em;
        font-weight: bold;
        box-shadow: 0 10px 40px rgba(255, 105, 180, 0.6);
        z-index: 10001;
        animation: notificationPopup 0.5s ease;
        border: 4px solid white;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
        notification.style.animation = 'notificationPopdown 0.5s ease forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 2000);
}

// ========== 添加通知动画CSS ==========
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes notificationPopup {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes notificationPopdown {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }
    }
    
    @keyframes heartRise {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-100vh);
        }
    }
`;
document.head.appendChild(notificationStyle);

// ========== 平滑滚动 ==========
function smoothScroll(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// ========== 懒加载图片优化 ==========
function setupLazyLoading() {
    const images = document.querySelectorAll('.memory-photo, .sticker img, .end-sticker img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// 页面加载完成后设置懒加载
document.addEventListener('DOMContentLoaded', setupLazyLoading);

// ========== 页面可见性变化处理 ==========
document.addEventListener('visibilitychange', function() {
    const autoMusic = document.getElementById('autoMusic');
    
    // 当页面不可见时暂停音乐
    if (document.hidden) {
        if (!autoMusic.paused) {
            autoMusic.pause();
        }
    } else if (autoMusicPlayed) {
        // 页面重新可见时继续播放
        autoMusic.play().catch(() => {
            // 忽略自动播放限制
        });
    }
});

// ========== 控制台欢迎信息 ==========
console.log('%c💕 十年友谊回忆相册 💕', 'color: #FF1493; font-size: 20px; font-weight: bold;');
console.log('%c给最可爱的你 - 2016-2025', 'color: #FF69B4; font-size: 14px;');
console.log('%c愿我们的友谊地久天长 🌸', 'color: #FFB6C1; font-size: 12px;');

// ========== 分享功能（可选） ==========
function shareAlbum() {
    if (navigator.share) {
        navigator.share({
            title: '我们的十年 · 从校服到未来',
            text: '给最可爱的你 💕 2016-2025',
            url: window.location.href
        }).catch(err => console.log('分享取消'));
    } else {
        showNotification('💕 浏览器不支持分享功能');
    }
}

// ========== 导出功能（保存留言到文件） ==========
function exportMessages() {
    const messages = JSON.parse(localStorage.getItem('friendshipMessages') || '[]');
    
    if (messages.length === 0) {
        showNotification('💝 还没有留言可以导出哦～');
        return;
    }
    
    let exportText = '💕 我们的十年友谊纪念留言 💕\n\n';
    messages.forEach((msg, index) => {
        exportText += `${index + 1}. ${msg.text}\n   时间：${msg.timestamp}\n\n`;
    });
    
    const blob = new Blob([exportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `十年友谊留言_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('💌 留言已导出');
}

// 页面加载完成提示
window.addEventListener('load', function() {
    setTimeout(() => {
        console.log('%c网站加载完成！', 'color: #FF1493; font-size: 16px;');
    }, 500);
});



function randomizeStickerPositions() {
    const container = document.getElementById('randomStickersContainer');
    if (!container) return;
    // 这里以主内容容器为区域参照（比如.timeline-container），不指定就用body
    const bounding = (document.querySelector('.timeline-container') || document.body).getBoundingClientRect();
    const stickers = container.querySelectorAll('.sticker.dynamic-random');
    stickers.forEach(img => {
        // 避免盖住菜单，头部和底部，设定合理范围
        const minTop = bounding.top + 60;
        const maxTop = bounding.top + bounding.height - 180;
        const top = Math.random() * (maxTop - minTop) + minTop;
        const minLeft = bounding.left + 20;
        const maxLeft = bounding.left + bounding.width - 120;
        const left = Math.random() * (maxLeft - minLeft) + minLeft;
        img.style.top = top + 'px';
        img.style.left = left + 'px';
    });
}

function likePhoto(btn) {
    btn.classList.toggle('active');
    let countElem = btn.querySelector('.like-count');
    let count = parseInt(countElem.textContent, 10);
    if (btn.classList.contains('active')) {
        countElem.textContent = count + 1;
    } else {
        countElem.textContent = count > 0 ? count - 1 : 0;
    }
}
function toggleCommentBox(btn) {
    let photoCard = btn.closest('.photo-card');
    let section = photoCard.querySelector('.comment-section');
    if (section.style.display !== 'block') {
        section.style.display = 'block';
        setTimeout(()=>{
          section.querySelector('.comment-input').focus();
        },100);
    } else {
        section.style.display = 'none';
    }
}
function submitComment(btn) {
    let photoCard = btn.closest('.photo-card');
    let input = photoCard.querySelector('.comment-input');
    let text = input.value.trim();
    if(!text) return;
    let list = photoCard.querySelector('.comments-list');
    let commentDiv = document.createElement('div');
    commentDiv.className = 'comment-item';
    commentDiv.textContent = '我: ' + text;
    list.appendChild(commentDiv);
    input.value = '';
}

// 背景音乐按钮入口，不受其它任何代码影响
(function(){
  function showInfo(msg){
    try{ clearTimeout(window.__bgmTipT); let d = document.getElementById('__bgminfo');
    if(!d){ d=document.createElement('div');d.id='__bgminfo';d.style.cssText='position:fixed;top:85px;left:48px;z-index:2999;background:rgba(255,105,180,.97);color:#fff;padding:7px 28px;border-radius:24px;font-size:1em;box-shadow:0 0 7px #ffd0f4;';document.body.appendChild(d);}
    d.textContent=msg; d.style.display='block';
    window.__bgmTipT=setTimeout(()=>{d.style.display='none';},1500);}catch(e){} }
  document.addEventListener('DOMContentLoaded',function(){
    var btn = document.getElementById('bgmBtn');
    var audio = document.getElementById('bgmAudio');
    if(!btn||!audio) return;
    function updateBtn(){btn.textContent=audio.paused?'🔔 播放背景音乐':'⏸️ 暂停背景音乐';}
    btn.onclick=function(){
      if(audio.paused){
        audio.play().then(()=>{
          showInfo('🎵 BGM已播放'); updateBtn();
        }).catch(()=>{ showInfo('❌ 无法播放音频'); });
      }else{
        audio.pause(); updateBtn(); showInfo('⏸ 已暂停');
      }
    };
    audio.addEventListener('ended',updateBtn);
    updateBtn();
  });
})();

// 3D正方体轮播功能
let cubeX = 30;
let cubeY = 45;
let cubeInterval;
let isCubePlaying = true;
let isDragging = false;
let previousX, previousY;

// 初始化正方体轮播
function initHolidayCube() {
    const cube = document.getElementById('holidayCube');
    const container = document.getElementById('cubeContainer');
    const playPauseBtn = document.getElementById('cubePlayPauseBtn');
    
    // 设置初始旋转角度
    cube.style.transform = `rotateX(${cubeX}deg) rotateY(${cubeY}deg)`;
    
    // 事件监听 - 鼠标和触摸设备
    container.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    container.addEventListener('touchstart', startDrag, { passive: true });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    // 播放/暂停按钮
    playPauseBtn.addEventListener('click', toggleCubePlayPause);
    
    // 开始自动旋转
    startCubeRotation();
    
    // 初始化留言墙功能
    initMessageWall();
}

// 开始拖拽
function startDrag(e) {
    isDragging = true;
    
    // 暂停自动旋转
    if (isCubePlaying) {
        pauseCubeRotation();
        isCubePlaying = false;
        document.getElementById('cubePlayPauseBtn').textContent = '▶';
    }
    
    // 获取初始位置（支持触摸和鼠标）
    if (e.type === 'touchstart') {
        previousX = e.touches[0].clientX;
        previousY = e.touches[0].clientY;
    } else {
        previousX = e.clientX;
        previousY = e.clientY;
    }
}

// 拖拽中
function drag(e) {
    if (!isDragging) return;
    
    // 阻止触摸滑动的默认行为
    if (e.type === 'touchmove') {
        e.preventDefault();
    }
    
    // 获取当前位置
    let currentX, currentY;
    if (e.type === 'touchmove') {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
    } else {
        currentX = e.clientX;
        currentY = e.clientY;
    }
    
    // 计算移动距离
    const deltaX = currentX - previousX;
    const deltaY = currentY - previousY;
    
    // 更新旋转角度
    cubeY += deltaX * 0.5;
    cubeX -= deltaY * 0.5;
    
    // 应用旋转
    const cube = document.getElementById('holidayCube');
    cube.style.transform = `rotateX(${cubeX}deg) rotateY(${cubeY}deg)`;
    
    // 更新上一位置
    previousX = currentX;
    previousY = currentY;
}

// 结束拖拽
function endDrag() {
    isDragging = false;
}

// 开始自动旋转
function startCubeRotation() {
    cubeInterval = setInterval(() => {
        cubeY += 1;
        const cube = document.getElementById('holidayCube');
        cube.style.transform = `rotateX(${cubeX}deg) rotateY(${cubeY}deg)`;
    }, 50);
}

// 暂停自动旋转
function pauseCubeRotation() {
    clearInterval(cubeInterval);
}

// 切换播放/暂停状态
function toggleCubePlayPause() {
    const playPauseBtn = document.getElementById('cubePlayPauseBtn');
    
    if (isCubePlaying) {
        pauseCubeRotation();
        playPauseBtn.textContent = '▶';
    } else {
        startCubeRotation();
        playPauseBtn.textContent = '⏸';
    }
    
    isCubePlaying = !isCubePlaying;
}

// ========== 留言功能（替换为LeanCloud云端存储） ==========
// 定义LeanCloud留言表
const Message = AV.Object.extend('Message');

function submitMessage() {
    // 注意：对应HTML中的输入框ID（根据最新代码调整）
    const authorInput = document.getElementById('messageAuthor');
    const contentInput = document.getElementById('messageContent');
    const author = authorInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!author) {
        showNotification('👤 请输入你的名字～');
        return;
    }
    if (!content) {
        showNotification('💬 请输入留言内容哦～');
        return;
    }
    
    // 创建云端留言对象（包含作者信息）
    const message = new Message();
    message.set('author', author);
    message.set('content', content);
    message.set('timestamp', new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }));
    
    // 保存到LeanCloud云端
    message.save().then(savedMessage => {
        // 显示新留言
        displayMessage({
            author: savedMessage.get('author'),
            content: savedMessage.get('content'),
            timestamp: savedMessage.get('timestamp')
        });
        
        // 清空输入框
        authorInput.value = '';
        contentInput.value = '';
        showNotification('💌 留言已同步到云端，所有人可见～');
    }).catch(error => {
        console.error('留言保存失败:', error);
        showNotification('❌ 留言失败，请稍后再试');
    });
}

function displayMessage(message) {
    const container = document.getElementById('messagesContainer');
    
    // 清空初始提示文字
    if (container.innerHTML.trim() === '' || container.innerHTML.includes('暂无留言')) {
        container.innerHTML = '';
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-card'; // 使用现有样式类
    messageDiv.innerHTML = `
        <div class="message-author">${escapeHtml(message.author)} 说：</div>
        <div class="message-time">${message.timestamp}</div>
        <div class="message-text">${escapeHtml(message.content)}</div>
    `;
    
    container.appendChild(messageDiv);
    container.scrollTop = container.scrollHeight; // 滚动到底部
}

function loadMessages() {
    const container = document.getElementById('messagesContainer');
    // 从LeanCloud查询所有留言（按时间倒序）
    const query = new AV.Query('Message');
    query.descending('createdAt'); // 最新的留言显示在前面
    query.find().then(messages => {
        if (messages.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999; font-size: 1.1em;">暂无留言，快来写下你的心声吧～</p>';
            return;
        }
        
        // 显示所有云端留言
        messages.forEach(msg => {
            displayMessage({
                author: msg.get('author'),
                content: msg.get('content'),
                timestamp: msg.get('timestamp')
            });
        });
    }).catch(error => {
        console.error('加载留言失败:', error);
        container.innerHTML = '<p style="text-align: center; color: #f00; font-size: 1.1em;">加载留言失败，请刷新页面重试</p>';
    });
}

// 清除所有留言（云端数据，谨慎使用）
function clearAllMessages() {
    if (confirm('确定要清除所有云端留言吗？此操作不可恢复！')) {
        const query = new AV.Query('Message');
        query.find().then(messages => {
            return AV.Object.destroyAll(messages);
        }).then(() => {
            document.getElementById('messagesContainer').innerHTML = '<p style="text-align: center; color: #999; font-size: 1.1em;">暂无留言，快来写下你的心声吧～</p>';
            showNotification('🗑️ 所有云端留言已清除');
        }).catch(error => {
            console.error('清除留言失败:', error);
            showNotification('❌ 清除失败，请稍后再试');
        });
    }
}
// 正方体旋转功能
document.addEventListener('DOMContentLoaded', function() {
  const cube = document.getElementById('holidayCube');
  const playPauseBtn = document.getElementById('cubePlayPauseBtn');
  
  // 旋转状态变量
  let isRotating = true;
  let rotateX = 0;
  let rotateY = 0;
  let lastX, lastY;
  let isDragging = false;
  
  // 自动旋转函数
  function autoRotate() {
    if (isRotating) {
      rotateY += 0.5;
      updateCubeRotation();
    }
    requestAnimationFrame(autoRotate);
  }
  
  // 更新正方体旋转状态
  function updateCubeRotation() {
    cube.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }
  
  // 切换播放/暂停
  playPauseBtn.addEventListener('click', function() {
    isRotating = !isRotating;
    playPauseBtn.textContent = isRotating ? '⏸' : '▶';
  });
  
  // 鼠标拖动旋转
  cube.parentElement.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('mouseleave', endDrag);
  
  // 触摸设备支持
  cube.parentElement.addEventListener('touchstart', startDrag, { passive: true });
  document.addEventListener('touchmove', drag, { passive: true });
  document.addEventListener('touchend', endDrag);
  
  function startDrag(e) {
    isDragging = true;
    // 处理鼠标和触摸事件
    if (e.type === 'mousedown') {
      lastX = e.clientX;
      lastY = e.clientY;
    } else {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    }
    // 拖动时暂停自动旋转
    isRotating = false;
    playPauseBtn.textContent = '▶';
  }
  
  function drag(e) {
    if (!isDragging) return;
    
    let currentX, currentY;
    if (e.type === 'mousemove') {
      currentX = e.clientX;
      currentY = e.clientY;
    } else {
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
    }
    
    // 计算旋转差值
    const deltaX = currentX - lastX;
    const deltaY = currentY - lastY;
    
    rotateY += deltaX * 0.5;
    rotateX -= deltaY * 0.5;
    
    // 更新旋转
    updateCubeRotation();
    
    // 保存当前位置
    lastX = currentX;
    lastY = currentY;
  }
  
  function endDrag() {
    isDragging = false;
  }
  
  // 启动自动旋转
  autoRotate();
});