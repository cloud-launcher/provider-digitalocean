import fs from 'fs';
import promise from 'promise-callback';

import pipe from 'gulp-pipe';

module.exports = (gulp) => {
  gulp.task('createProfile', ['runtime'], () => {
    const create = require('../.dist/profile/create'),
          API = () => {},
          credentials = {};

    return create(API, credentials)
      .then(
        profile => promise(fs.writeFile,
                            './profiles/profile.json',
                            JSON.stringify(profile, null, '  ')),
        error => console.log('Error creating profile', error.stack));
  });

  gulp.task('copyProfile',
    () => pipe([
      gulp.src(['./profiles/*.{js,json}'])
      ,gulp.dest('.dist/profile')
    ]));
};