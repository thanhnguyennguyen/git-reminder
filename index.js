const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
})
const noti_bot = require('noti_bot')
const notifyTelegram = noti_bot.telegram
const notifySlack = noti_bot.slack


// get list issues assigned to me
const axios = require('axios')
axios({
        method: "get",
        url: 'https://api.github.com/user/issues',
        headers: {
            Authorization: `Bearer ` + process.env.GIT_TOKEN,
            "Content-Type": "application/json"
        },
    })
    .then(res => {
        filterMyIssue(res.data)
    })
    .catch(err => {
        console.log(err)
    });

const filterMyIssue = (data) => {
    let msg = "Issues assigned to you \\n"
    let count = 0
    if (!Array.isArray(data)) {
        return
    }
    data.forEach(i => {
        if (i.assignee.login == process.env.GIT_USERNAME) {
            count++
            msg = msg + i.html_url + "\\n"
        }
    });
    if (count > 0) {
        notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME, process.env.SLACK_BOT_ICON)
    }
}

// get list PR waiting for my review
axios({
        method: "get",
        url: 'https://api.github.com/repos/' + process.env.GIT_REPO,
        headers: {
            Authorization: `Bearer ` + process.env.GIT_TOKEN,
            "Content-Type": "application/json"
        },
    })
    .then(res => {
        filterMyReview(res.data)
    })
    .catch(err => {
        console.log(err)
    });

const filterMyReview = (data) => {
    let msg = "PR waiting for my review \\n"
    let count = 0
    if (!Array.isArray(data)) {
        return
    }

    data.forEach(i => {
        if (!Array.isArray(i.requested_reviewers)) {
            return
        }

        i.requested_reviewers.forEach(r => {

            if (r.login == process.env.GIT_USERNAME) {
                count++
                msg = msg + i.html_url + "\\n"
            }
        })
    });
    if (count > 0) {
        notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME, process.env.SLACK_BOT_ICON)
    }
}
