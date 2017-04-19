   node bin/fetch -s content -e production
   node bin/fetch -s content -e staging

   node bin/fetch -s dashboard -e production
   node bin/fetch -s dashboard -e staging

   node bin/fetch -s formatted_data -e production
   node bin/fetch -s formatted_data -e staging

   node bin/fetch -s portfolio -e production
   node bin/fetch -s portfolio -e staging

   node bin/repositories -s repositories -r bitbucket -e production
   node bin/repositories -s repositories -r bitbucket -e staging
   node bin/repositories -s repositories -r github -e production
   node bin/repositories -s repositories -r github -e staging

   node bin/fetch  -s stories -e production
   node bin/fetch -s stories -e staging

   node bin/fetch  -s ureport -e production
   node bin/fetch -s ureport -e staging

   node bin/fetch -s say_cel -e production
   node bin/fetch -s say_cel -e staging
   node bin/fetch  -s somleng -e production
   node bin/fetch -s somleng -e staging
   node bin/fetch -s iogt -e production
   node bin/fetch -s iogt -e staging
