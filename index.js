const path = require('path')
require('dotenv').config({
    path: path.resolve(__dirname, './.env')
})
const noti_bot = require('noti_bot')
const notifyTelegram = noti_bot.telegram
const notifySlack = noti_bot.slack
const axios = require('axios')

// get list issues assigned to me
const checkAssignedIssues = () => {
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
}

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
        notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT)
        notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME, process.env.SLACK_BOT_ICON)
    }
}

// get list PR waiting for my review
const checkPendingReview = async () => {
    let msg = "PR waiting for my review \\n"
    let result = []
    let authorizedRequest = await axios.create({
        timeout: 2000,
        headers: {
            'Authorization': `Bearer ` + process.env.GIT_TOKEN,
            'Content-Type': 'application/json'
        }
    })
    process.env.GIT_REPO.split(',').forEach(async (repo) => {
        try {
            let res = await authorizedRequest.get('https://api.github.com/repos/' + repo + '/pulls')
            result.push(filterMyReview(res.data))
        } catch (err) {
            console.log(err)
        }
    })
    if (result.length > 0) {
        result.forEach(r => {
            msg = msg + r + "\\n"
        })
        notifyTelegram(msg, process.env.TELEGRAM_TOKEN, process.env.TELEGRAM_CHAT)
        notifySlack(msg, process.env.SLACK_HOOK_KEY, process.env.SLACK_CHANNEL, process.env.SLACK_BOTNAME, process.env.SLACK_BOT_ICON)
    }
}


const filterMyReview = (data) => {
    if (!Array.isArray(data)) {
        return
    }
    let result = []
    data.forEach(i => {
        if (!Array.isArray(i.requested_reviewers)) {
            return
        }

        i.requested_reviewers.forEach(r => {

            if (r.login == process.env.GIT_USERNAME) {
                result.push(i.html_url)
            }
        })
    });
    return result
}

//checkAssignedIssues()
checkPendingReview()