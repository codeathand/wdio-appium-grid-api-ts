# wdio-mobile-api-ts

## Getting started

git init
git status
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/codeathand/wdio-appium-grid-api-ts.git
git push -u origin main
git push https://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@github.com/codeathand/wdio-appium-grid-api-ts.git main

git remote set-url origin https://github.com/codeathand/wdio-mobile-api-ts.git
git remote -v

git branch -M main

git config --global credential.helper store

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

git remote set-url origin "https://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@github.com/codeathand/wdio-mobile-api-ts.git"

git push https://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@github.com/codeathand/wdio-mobile-api-ts.git main

git ls-remote https://github.com/codeathand/wdio-mobile-api-ts.git

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/ee/gitlab-basics/add-file.html#add-a-file-using-the-command-line) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin http://gitlab01.alcoyu.co.yu/mistosic/wdio-mobile-api-ts.git
git branch -M master
git push -uf origin master
```

## Integrate with your tools

- [ ] [Set up project integrations](http://gitlab01.alcoyu.co.yu/mistosic/wdio-mobile-api-ts/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/ee/user/project/merge_requests/merge_when_pipeline_succeeds.html)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/index.html)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing(SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

---

# Editing this README

## Suggestions for a good README

## Name

## Description

A) Framework methods:

1. clickByLocator Xpath, cross platform based. Use it to click (locatorKey: string, index?: number, timeout = 8000, dynamic = false):

a) on defined locators from index.ts/flutter generated (2 languages support), example: await clickByLocator('dashboard_bottom_navigation_menu');
b) on specific value (dynamic) visible on ui, example: await clickByLocator('115-0381641949000-23', undefined, 1000, true);
c) on defined or specific value (dynamic) by index, examples: await clickByLocator('115-0381641949000-23', 1, 1000, true); or await clickByLocator('dashboard_bottom_navigation_menu', 1);

2. clickButtonNear

## Badges

## Visuals

## Installation

A) Precondition lib/tools:

1. Android studio,
2. Java SDK
3. Node.js (v.20)

B) Framework setup:

1. setup user enviorment var PC_NAME, example win setx PC_NAME "MilosPC"

## Usage

A) Selenium Grid - local
Setup:

- latest version of selenium-server-${version}}.jar, current version is (4.34.0)
- connect real device or create emulator(s),
- run command in terminal to generate config files (appium.yml and node.toml):
  a) npx ts-node grid_appium_ios.ts - for ios/mac
  b) npx ts-node grid_appium_android.ts - for android/windows and linux
- move generated file in folder selenium_grid\local\windows\${PC_NAME} - only for windows
- map ports in files generated files appium.yml and node.toml

Run:
A) Selenium Grid - local

1. Depends on machine run script(s):

- "grid:start:linux": "cross-env MACHINE=linux ts-node selenium_grid/local/startGrid.ts",
- "grid:start:windows": "cross-env MACHINE=windows ts-node selenium_grid/local/startGrid.ts",
- "grid:start:mac": "cross-env MACHINE=mac ts-node selenium_grid/local/startGrid.ts",

2. Adding more device(s) to Grid, example (change path):

- appium --config "C:\sources\migration\wdio-mobile-api-ts\selenium_grid\local\windows\PC_Milos\.appium-configs\appium-2.yml"
- java -jar "C:\sources\migration\wdio-mobile-api-ts\selenium_grid\local\lib\selenium-server-4.34.0.jar" node --config "C:\sources\migration\wdio-mobile-api-ts\selenium_grid\local\windows\PC_Milos\.appium-nodes\node-2.toml"

3.  Verify Selenium Grid (status, registrated devices)

- Open browser: http://localhost:4444/ui/ or http://{serverIP}}:4444/ui/
- Check 3 opened terminals should run without errors

## Support

## Roadmap

## Contributing

## Authors and acknowledgment

## License

## To DO

- framework:

1. hooks: change logic/element to get 'Enter pin code...' insted of current setup, use generic methods/locators
2. data: users data get from .json or from feature, save in memories-map values, clear after/after cucamber hook
3. ui-utils: create methods actions (click, setValue, expect, getValue) and improve locator strategy (add basic check on begining of patterns)
4. wdio: test current wdio with tags: smoke, regression, current add paralell run per servers
5. wdio: create wdio.recored to listen user action easy go creation of test
6. files: remove delete folder and unused methods
7. readme: document project
8. feature: create test gerhin based (scenario: ID_TCName, descriptive steps, patterns for finding)
9. global methods: create method to generate amount by current time, save in memories
10. methods: test methods emulator and real devices
11. api: create method to get data from grafana after UI action and store data
12. env: extend env var for 'secret' var and method for de/coding base url
13. hooks: map jpmeg port/server defined global browser
14. jira: project config with TL/members
15. package json: define run scripts local(windows,mac)/remote(linux,mac)
16. allure: script publishing result and ui integrate
17. allure: adjust report with yettel info (icon,text)
18. fix: start selenium server on mac
19. tc: develop new tcs
20. tc: migrate old tcs smoke regresion
21. install apps: continue development of ui installation by tester app and
22. imporove: generate_locators script to add just new selecors, optional api call Azure automatic update
23. api-ui test: integrate blocking/unblocking
24. api-ui test: integrate preappoval

- ops:

1. selenium grid: create service for starting server on linux and expose end url 4444 and jpmeg defined ports (bash),
2. selenium grid mac: create service for starting server on mac and expose end url 4444 and jpmeg defined ports (plist)
