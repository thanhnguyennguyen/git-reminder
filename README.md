# git-reminder
help me to check if there is any pending review request, new assigned issues

setup cronjob to remind me about these information at 16:00 every weekday

```bash
# git reminder
0 9 * * 1-5 cd git-reminder && node index.js

```
