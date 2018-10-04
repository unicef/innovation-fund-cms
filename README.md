node bin/fetch -s content -e production
node bin/fetch -s dashboard -e production
node bin/fetch -s formatted_data -e production
node bin/fetch -s portfolio -e production
node bin/fetch -s insights -e production

node bin/fetch -s content -e staging
node bin/fetch -s dashboard -e staging
node bin/fetch -s formatted_data -e staging
node bin/fetch -s portfolio -e staging
node bin/fetch -s insights -e staging

node bin/fetch -s repositories -r bitbucket -e staging
node bin/fetch -s repositories -r github -e staging
node bin/fetch -s repositories -r bitbucket -e production
node bin/fetch -s repositories -r github -e production

node bin/fetch -s youth_engagement -e staging
node bin/fetch -s youth_engagement -e production
node bin/fetch -s stories -e staging
node bin/fetch -s stories -e production
node bin/fetch -s ureport -e staging
node bin/fetch -s ureport -e production
node bin/fetch -s saycel -e staging
node bin/fetch -s saycel -e production
node bin/fetch -s somleng -e staging
node bin/fetch -s somleng -e production
# Innovation Fund CMS

### Run frequently

*/10 * * * * node ./innovation-fund-cms/bin/fetch -s content -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s dashboard -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s formatted_data -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s portfolio -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s insights -e production

*/10 * * * * node ./innovation-fund-cms/bin/fetch -s content -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s dashboard -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s formatted_data -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s portfolio -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s insights -e staging

*/10 * * * * node ./innovation-fund-cms/bin/fetch -s repositories -r bitbucket -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s repositories -r bitbucket -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s repositories -r github -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s repositories -r github -e production

*/10 * * * * node ./innovation-fund-cms/bin/fetch -s youth_engagement -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s youth_engagement -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s stories -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s stories -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s ureport -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s ureport -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s saycel -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s saycel -e production
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s somleng -e staging
*/10 * * * * node ./innovation-fund-cms/bin/fetch -s somleng -e production
0 2 * * * node ./innovation-fund-cms/bin/fetch -s iogt -e staging
0 2 * * * node ./innovation-fund-cms/bin/fetch -s iogt -e production



    node bin/fetch -s content -e staging
    node bin/fetch -s dashboard -e staging
    node bin/fetch -s formatted_data -e staging
    node bin/fetch -s portfolio -e staging
    node bin/fetch -s insights -e staging
    node bin/fetch -s content -e production
    node bin/fetch -s dashboard -e production
    node bin/fetch -s formatted_data -e production
    node bin/fetch -s portfolio -e production
    node bin/fetch -s insights -e production




### Run once a day
    node bin/fetch -s repositories -r bitbucket -e staging
    node bin/fetch -s repositories -r bitbucket -e production
    node bin/fetch -s repositories -r github -e staging
    node bin/fetch -s repositories -r github -e production
    node bin/fetch -s youth_engagement -e staging
    node bin/fetch -s stories -e staging
    node bin/fetch -s ureport -e staging
    node bin/fetch -s saycel -e staging
    node bin/fetch -s somleng -e staging
    node bin/fetch -s iogt -e staging

    node bin/fetch -s repositories -r bitbucket -e production
    node bin/fetch -s repositories -r github -e production
    node bin/fetch -s youth_engagement -e production
    node bin/fetch  -s stories -e production
    node bin/fetch  -s ureport -e production
    node bin/fetch -s saycel -e production
    node bin/fetch  -s somleng -e production
    node bin/fetch -s iogt -e production
