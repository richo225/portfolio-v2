---
title: Build a ChatGPT CLI
description: Build a ruby gem that allows you to interact with the ChatGPT API from the command line.
date: 2023-05-05
draft: false
slug: /blog/2023-05-05
tags:
  - ChatGPT
  - Ruby
  - Gem
---

ChatGPT is taking the world by storm and could be considered one of the biggest innovations in the tech scene in the past few years. If you haven't already tried it out, head over to https://chat.openai.com and sign up. The API can take a variety of inputs ranging from:

> What is the capital of Taiwan?

all the way to

> Please write me a CV section in three bullet points for my time working at a fintech called blah where I was a software engineer working on blah.

Wouldn't it be great if we could access this API from the comfort of our command line instead of via the chatGPT website; we are software engineers after all! In this blog post, we're going to first walk through how to connect to the chatGPT API with some ruby code and then finally convert the code into a publishable gem that you can share with the community.

## Getting access to the API

Before we can start making requests to the ChatGPT API, we need an API key for authentication. Head over to https://auth0.openai.com/u/signup and create an account if you have not yet done so. Once signed up, you can create an API key via https://platform.openai.com/account/api-keys.

## Interacting with ChatGPT

The OpenAI team provide quite a few endpoints but the one we're interested in is `chat` at https://api.openai.com/v1/chat/completions. Below is an example curl request to this API:

```shell{outputLines: 2-8}{promptUser: rich}{promptHost: localhost}
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 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" \
  -d '{
     "model": "gpt-3.5-turbo",
     "messages": [{"role": "user", "content": "What is the capital of Taiwan?"}],
     "temperature": 0.7
   }'

```

In this code, we are making a HTTP POST request to https://api.openai.com/v1/chat/completions, passing in our created API key in the header as well as body parameters for the `model`, `temperature` as well as `messages` ie. our prompt. You can see the JSON response we get back below - note the ChatGPT response nested inside `"choices"[0]["message"]["content"]` :

```JSON
{
  "id":"chatcmpl-7Cv0NoaKHrvKIj2f600nNFgVenZlM",
  "object":"chat.completion",
  "created":1683313419,
  "model":"gpt-3.5-turbo-0301",
  "usage":{
    "prompt_tokens":15,
    "completion_tokens":7,
    "total_tokens":22
  },
  "choices":[
    {
      "message":{
        "role":"assistant",
        "content":"The capital of Taiwan is Taipei."
      },
      "finish_reason":"stop",
      "index":0
    }
  ]
}
```

## Creating our own ruby gem

To begin making our own ruby gem that will utilise ruby-openai, first make sure you have bundler installed with `bundle -v` and then create your gem with whatever name you want:

```shell{promptUser: rich}{promptHost: localhost}
bundle gem <YOUR_GEM_NAME>
cd <YOUR_GEM_NAME>

```

Bundler will then ask you for some extra configuration before it creates your gem directory. We won't be writing any tests or configuring a CI in this blog, but it is good practice to initialise them if ever required in the future. You should therefore pick the following configurations:

![Bundle Gem Setup](./bundle_gem.png)

Once you have selected all the configurations, bundler will then create a new directory with the following files and initialise a git repository. Note that going forward I am providing snippets from my created gem called `chatgpt`:

---

```shell:title=chatgpt/
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
├── Gemfile
├── LICENSE.txt
├── README.md
├── Rakefile
├── bin
│   ├── console
│   └── setup
├── chatgpt.gemspec
├── lib
│   ├── chatgpt
│   │   └── version.rb
│   └── chatgpt.rb
├── sig
│   └── chatgpt.rbs
└── spec
    ├── chatgpt_spec.rb
    └── spec_helper.rb
```

## Exploring the gem directory

As you can see the directory looks very similar to a normal ruby program that you have hopefully built before:

- `Rakefile` => Any rake tasks we need to run can be written here. Bundler has already added the `build`, `install` and `release` tasks
- `Gemfile` => Specifies any gems depended on by your library. We will add these to the `.gemspec` instead which can be seen loaded in the `gemspec` line
- `spec` => Contains any tests that we write
- `lib/blog_chatgpt.rb` => This is the main file to define our code. It is required by Bundler when your gem is loaded
- `lib/blog_chatgpt` => Contains any other business logic such as classes or clients required by `lib/blog_chatgpt.rb`

One of the most important files which you will not see in normal ruby programs is the `.gemspec`. Let's take a look at this file and go through the changes that need to be made. The gemspec contains information and any other metadata regarding your gem. Take a look at any popular gem hosted on rubygems such as [Rails](https://rubygems.org/gems/rails) and you will see that the `name`, `version`, `authors`, `summary`, `homepage` and others can be seen on the rubygems page; these are all coming from the `.gemspec`!

Go through this file and update it accordingly with your details as the author. `homepage`, `source_code_uri` and `changelog_uri` can be left blank for now as we have not yet published the git repository or ruby gem. You will end up with something like below:

```ruby:title=chatgpt.gemspec
# frozen_string_literal: true

require_relative "lib/chatgpt/version"

Gem::Specification.new do |spec|
  spec.required_ruby_version = ">= 2.6.0"
  spec.name                  = "chatgpt"
  spec.version               = Chatgpt::VERSION
  spec.authors               = ["Richard Bates"]
  spec.email                 = ["rich.bates@protonmail.com"]

  spec.description           = "CLI interface for OpenAI ChatGPT in Ruby"
  spec.summary               = spec.description
  spec.license               = "MIT"

  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").reject do |f|
      (f == __FILE__) || f.match(%r{\A(?:(?:bin|test|spec|features)/|\.(?:git|travis|circleci)|appveyor)})
    end
  end
  spec.executables   = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
  spec.require_paths = ["lib"]
end
```

Once done, we should run `bin/setup` to generate a `Gemfile.lock`, commit and push to a repository you should have created on Github:

```shell{promptUser: rich}{promptHost: master}
bin/setup
git add .
git commit -m "Initial gem setup with updated specification"
git remote add origin git@github.com:richo225/ruby-chatgpt.git
git branch -M master
git push -u origin master
```

## Using the Ruby OpenAI gem

Now let's code the juicy part of our gem!

Earlier we successfully interacted with the ChatGPT API and whilst we could make this HTTP request via ruby using any old http client, someone has already built a wrapper for us - [Ruby OpenAI](https://github.com/alexrudall/ruby-openai). This gem provides abstractions for all the OpenAI endpoints, is highly configurable and includes some extra functionality such as streaming. To make the same request from before with the gem, we can simply call `client.chat()`.

We need to add `ruby-openai` as a dependency so that when people install our gem, they must also install ruby-openai for it work. To do this, add `ruby-openai` to your gem specification:

```ruby{numberLines: 23}
spec.executables   = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
spec.require_paths = ["lib"]

spec.add_dependency 'ruby-openai', '~> 4.0' # highlight-line

```

Then we run `bin/setup` to install the `ruby-openai` gem and update the `.Gemfile.lock`. Commit this:

```shell{promptUser: rich}{promptHost: master}
bin/setup
git add .
git commit -m "Adds ruby-openai gem dependency"
git push origin master
```

Now inside of your `lib/YOUR_GEM_NAME.rb` file, we are going to add the ruby code for making a request to ChatGPT and printing it out to the terminal. Firstly we need to require the `ruby-openai` gem we just added as a dependency and initialise the client with our API key.

```ruby:title=lib/chatgpt.rb
# frozen_string_literal: true

require_relative "chatgpt/version"
require 'openai' # highlight-line

module Chatgpt
  class Error < StandardError; end
  # highlight-next-line
  # Your code goes here...
  # highlight-next-line
  client = OpenAI::Client.new(access_token: <YOUR_API_KEY>)

end
```

Because we are going to publish this source code to github and via RubyGems, we don't want to make our own api key visible and usable by every user who installs the gem. To fix this, we are going to replace the api key with an environment variable `ENV["OPENAI_API_KEY"]` that the user must set for themselves. We also create our own custom error called `MissingAPiKeyError` and raise it before initialising the client if the user has not set the environment variable:

```diff{numberLines: 6}
-  class Error < StandardError; end
+  class MissingApiKeyError < StandardError; end

+  unless ENV["OPENAI_API_KEY"]
+    raise MissingApiKeyError,
+          "Please set a value for the OPENAI_API_KEY variable"
+  end
-  client = OpenAI::Client.new(access_token: <YOUR_API_KEY>)
+  client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

```

```shell{promptUser: rich}{promptHost: master}
'<module:Chatgpt>': Please set a value for the OPENAI_API_KEY variable (Chatgpt::MissingApiKeyError)
```

Set the environment variable depending on which shell you use eg. `fish`, `bash`, `zsh`

```shell{promptUser: rich}{promptHost: master}
  set -g OPENAI_API_KEY "YOUR_API_KEY_GOES_HERE"
  echo 'export OPENAI_API_KEY=YOUR_API_KEY_GOES_HERE' >> ~/.bashrc
  echo 'export OPENAI_API_KEY=YOUR_API_KEY_GOES_HERE' >> ~/.zshrc
```

## Connecting to the ChatGPT API

Now that we have the client initialised, we can begin making the request to ChatGPT using `client.chat()`.

```ruby{numberLines: 8}
  client = OpenAI::Client.new(access_token: ENV["OPENAI_API_KEY"])

  #highlight-start
  print 'Enter a prompt: '
  input = gets.chomp
  #highlight-end

  #highlight-start
  response = client.chat(
    parameters: {
      model: 'gpt-3.5-turbo', # Required.
      messages: [{ role: 'user', content: input }], # Required.
      temperature: 0.7
    }
  )
  #highlight-end

  #highlight-next-line
  puts response['choices'][0]['message']['content']
end
```

Here we take the response from the ChatGPT API, pull out the value at the `"content"` key and print it out to the terminal. Now is a good time to test out this code by running the ruby file within the lib directory via `ruby lib/<YOUR_GEM_NAME>.rb`. You can see the full response printed out below as well as the content returned:

![Running the program](./ruby_test.png)

Again, don't forget to commit this feature:

```shell{promptUser: rich}{promptHost: master}
git add .
git commit -m "Request ChatGPT content and parse response"
git push origin master
```

## Continuous prompts and streaming

The current code is working correctly but it exits after a response is received from ChatGPT. To keep asking the user for inputs, we put the code inside of a loop and break the loop if the user types in `exit`. To speed up printing the output, the ruby-openai gem supports [streaming from the API in realtime](https://github.com/alexrudall/ruby-openai#streaming-chatgpt).

```ruby{numberLines: 4}{1,2,5,18, 12-14}
loop do
  print 'Enter a prompt (or "exit" to quit): '
  input = gets.chomp

  break if input.downcase == "exit"

  client.chat(
    parameters: {
      model: "gpt-3.5-turbo", # Required.
      messages: [{ role: "user", content: input }], # Required.
      temperature: 0.7,
      stream: proc do |chunk, _bytesize|
        print chunk.dig("choices", 0, "delta", "content")
      end
    }
  )

  puts
end
```

The new `stream` parameter takes a `proc` that receives the stream of text chunks back from ChatGPT as they are generated. A Proc is just a block of code that can be assigned to a variable or passed around. Each time one or more text chunks is received, the Proc will be called once with each chunk. The Proc then parses the chunk as a Hash and we print out the `content` within this Hash.

We can test this beautiful new code via the interactive ruby console, `IRB`. Run the `bin/console` executable which will run any setup, require our ruby file and load up the interpreter:

```shell{promptUser: rich}{promptHost: master}
bin/console
=> Enter a prompt (or "exit" to quit):
```

## Sign up with RubyGems

We now have a fully working gem but how do we share it? We could publish the repository on Github and have everyone clone it down, run `bundle install` and then `ruby lib/<YOUR_GEM_NAME>.rb`. But then what's been the point so far in setting up this package when we could have simply shared a single ruby file! We're instead going to package this source code into a gem and publish it to rubygems so that others only need to type `gem install <YOUR_GEM_NAME>` and then run it via `<YOUR_GEM_NAME>`.

The first thing we're going to do is commit the code we have so far via:

```shell{promptUser: rich}{promptHost: master}
git add .
git commit -m "Loop through user input and stream text chunks to stdout"
git push origin master
```

In order to push to rubygems, you must have an account. You can sign up at https://rubygems.org/sign_up.

## Building and testing the gem

To build our gem, we can run:

```shell{promptUser: rich}{promptHost: master}
gem build chatgpt
Successfully built RubyGem
  Name: chatgpt
  Version: 0.1.0
  File: chatgpt-0.1.0.gem
```

This will create a `<YOUR_GEM_NAME>-0.1.0.gem` file inside the root directory which is basically a glorifed TAR.

We can then install this gem using `gem install`

```shell
gem install chagpt-0.1.0.gem
```

However, if you type <YOUR_GEM_NAME> you will get a `command not found` error which is not good for users as we want them to be able to run the gem from wherever in the terminal. To make the gem available, we need to create an `executable` file in the `bin` directory and link it in our gem specification.

Create a new file inside the `bin` directory called `YOUR_GEM_NAME`, require the setup executable and then require the ruby code that is doing the heavy lifting.

```ruby:title=/bin/chatgpt
#!/usr/bin/env ruby

require "bundler/setup"
require "chatgpt"
```

To make this newly created file executable, we will change the permissions mode using `chmod`:

```shell{promptUser: rich}{promptHost: master}
chmod -x bin/<YOUR_GEM_NAME>
```

So that a user can run it wherever in the terminal, we also need to make sure the executable is added to the system `PATH` variable upon installation. To do this, simply add the line below to the gem specification:

```diff{numberLines: 21}
- spec.executables = spec.files.grep(%r{\Aexe/}) { |f| File.basename(f) }
+ spec.executables = ["chatgpt"]

```

When a user types `chatgpt` in their terminal, the gem will now look inside the `bin` directory for an executable called `chatgpt`.

Let's commit this change:

```shell{promptUser: rich}{promptHost: master}
git add .
git commit -m "Adds chatgpt executable with correct permissions"
git push origin master
```

## Gem versioning

The keen eyed of you may have spotted the `<YOUR_GEM_NAME>::VERSION` constant inside the gem specification earlier. This constant is defined in your `lib/YOUR_GEM_NAME/version.rb` and right now should have a value of `0.1.0`. This is an example of something called [semantic versioning](https://semver.org/) which is essentially a set of rules and requirements that decide how version numbers should be constructed. A version will be made up of three parts, `major`, `minor` and `patch` forming the full version of `major.minor.patch`. Therefore our gem currently has a minor version of 1 and 0 for major and patch.

Because our gem has not yet been published to rubygems, we do not need to change the version from `0.1.0`. Any user who installs our gem will not need to worry about which version to install as there will only be one.

Before we go on and publish this gem version, now is a good time to add a `git tag` to the latest commit to indicate which part of our code history is a specific version and then push it up to github.

```shell{promptUser: rich}{promptHost: master}
git tag -a v0.1.0 -m "Initial v0.1.0"
git push origin v0.1.0
```

## Publishing the gem

We can now publish the built gem in our directory to RubyGems via:

```shell{promptUser: rich}{promptHost: master}
# highlight-next-line
gem push <YOUR_GEM_NAME>-0.1.0.gem
# input your rubygems credentials when prompted
```

Now go to https://rubygems.org/ and search for your gem. If all went well, you should see your newly created gem page with all of the correct gem specifications as well as a single listed version of `0.1.0`.

## Making changes to your gem

One of the rules of [semantic versioning](https://semver.org/) is that:

> Once a versioned package has been released, the contents of that version MUST NOT be modified. Any modifications MUST be released as a new version

For example, let's say we now decide to change the ChatGPT model from `'gpt-3.5-turbo'` to `'gpt-2.5'` and we commit this change.

```diff{numberLines: 18}
-   model: "gpt-3.5-turbo", # Required.
+   model: "gpt-2.5", # Required.

```

```shell{promptUser: rich}{promptHost: master}
git commit -m "Changes desired model from gpt-3.5-turbo to gpt-2.5"
git push origin master
```

This may not seem like a serious change but you have to think about the users who are installing your gem. We have completely changed the API request we are making to ChatGPT and therefore the potential response that comes back. The contents of `0.1.0` MUST NOT be modified as per the rules and therefore we need to release our updated gem under a new version.

But what version do we change it to? Is this a major change, a minor or a patch? The semver rules state:

> 1. MAJOR version when you make incompatible API changes
> 2. MINOR version when you add functionality in a backwards compatible manner
> 3. PATCH version when you make backwards compatible bug fixes

The change we have made is backward compatible as someone could switch gem versions and it would still work without errors, so therefore we are going to bump our gem version from `0.1.0` to `0.2.0`. To do this, simply change the value of `<YOUR_GEM_NAME>::VERSION` in the `lib/YOUR_GEM_NAME/version.rb` file. We then update the Gemfile.lock gem version via bundle install, commit the changes and tag the commit:

```diff:title=lib/chatgpt/version.rb
module Chatgpt
- VERSION = "0.1.0"
+ VERSION = "0.2.0"
end

```

```shell{promptUser: rich}{promptHost: master}
bin/setup
git commit -m "Bump <YOUR_GEM_NAME> v0.2.0"
git tag -a v0.2.0 -m "Bump to v0.2.0"
git push origin master
```

Now we can build the gem again for 0.2.0 and publish this new version to rubygems:

```shell{promptUser: rich}{promptHost: master}
gem build <YOUR_GEM_NAME>
gem push <YOUR_GEM_NAME>-0.2.0.gem
```

Congratulations! Your new gem version is now available on RubyGems. To install it globally, run:

```shell{promptUser: rich}{promptHost: master}
gem install <YOUR_GEM_NAME>
```

And run it from wherever you are in the terminal via:

```shell{promptUser: rich}{promptHost: master}
<YOUR_GEM_NAME>
```

## Summary

There are many more features we could add to this gem in the future:

- Perhaps a user wants to interact with other OpenAI endpoints and could therefore pass in cli arguments or flags? The [Thor toolkit](https://github.com/rails/thor) is amazing at this and will allow us to build a version of our gem on steroids!
- Add tests for existing functionality
- Use the existing bundler rake tasks for publishing to RubyGems
- Add a CI pipeline

I will leave these features off for you to play around with and perhaps I'll cover them in a separate article down the line. I hope you enjoyed reading this and are empowered to build more ruby gems to share! The source code can be found at [this github repository](https://github.com/richo225/ruby-chatgpt) and the published gem at [this ruby gems page](https://rubygems.org/gems/ruby-chatgpt).
