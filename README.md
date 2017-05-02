# Innovation Fund CMS

### Run frequently
    node bin/fetch -s content -e production
    node bin/fetch -s content -e staging

    node bin/fetch -s dashboard -e production
    node bin/fetch -s dashboard -e staging

    node bin/fetch -s formatted_data -e production
    node bin/fetch -s formatted_data -e staging
    node bin/fetch -s portfolio -e production
    node bin/fetch -s portfolio -e staging

### Run once a day
    node bin/fetch -s repositories -r bitbucket -e production
    node bin/fetch -s repositories -r bitbucket -e staging
    node bin/fetch -s repositories -r github -e production
    node bin/fetch -s repositories -r github -e staging
    node bin/fetch -e staging youth_engagement
    node bin/fetch -e production youth_engagement
    node bin/fetch  -s stories -e production
    node bin/fetch -s stories -e staging

    node bin/fetch  -s ureport -e production
    node bin/fetch -s ureport -e staging

    node bin/fetch -s saycel -e production
    node bin/fetch -s saycel -e staging
    node bin/fetch  -s somleng -e production
    node bin/fetch -s somleng -e staging
    node bin/fetch -s iogt -e production
    node bin/fetch -s iogt -e staging
