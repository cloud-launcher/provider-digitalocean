A template project for providers.

To create a new provider:

    $ ./create_provider.sh <new_provider_name>

That will clone this template repository to `../<new_provider_name>` and perform some initial setup.

You must still add the appropriate provider integration code in:

````
src/provider/*
src/profile/create.js
tasks/createProfile.js
````