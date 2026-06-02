const { exec } = require("child_process");

function fetchTranscriptWithYtDlp(videoUrl) {
  return new Promise((resolve, reject) => {

    const cmd =
      `yt-dlp --write-auto-subs --sub-lang en --skip-download --print "%(id)s" "${videoUrl}"`;

    exec(cmd, (error, stdout, stderr) => {

      if (error) {
        return reject(error);
      }

      resolve(stdout);
    });

  });
}

module.exports = {
  fetchTranscriptWithYtDlp,
};