#!/bin/bash
# 这一行叫 Shebang，告诉系统这个脚本要用 Bash 解释器来运行。

cd /opt/rsshub
# 切换工作目录到 RSSHub 的安装路径 `/opt/rsshub`。

python3 decrypt.py >> update_cookies.log 2>&1
# 1. 运行一个名为 `decrypt.py` 的 Python 脚本（看名字是用来解密或提取最新的 Cookies）。
# 2. `>> update_cookies.log`：把运行产生的正常日志「追加」到 update_cookies.log 文件里。
# 3. `2>&1`：把报错信息（标准错误）也一起塞进这个日志文件里，方便以后排查错误。

sleep 5
# 让脚本暂停（休眠） 5 秒钟，给上面的 Python 脚本留出充裕的时间完成文件写入。

sudo docker compose up -d --force-recreate rsshub
# 使用管理员权限（sudo）重启 Docker Compose 中名为 `rsshub` 的容器。
# 重启是为了让 RSSHub 重新加载刚刚更新好的 Cookies。

#chmod +x /opt/rsshub/update_cookies.sh
# 给这个脚本赋予「可执行权限」（+x）。
# 在 Linux 中，新建的脚本默认不能直接运行，必须先执行这一步。

#/opt/rsshub/update_cookies.sh
# 运行这个脚本。

#crontab -e
#0 */2 * * * /bin/bash /opt/rsshub/update_cookies.sh
#设置定时任务，每隔2小时自动运行
