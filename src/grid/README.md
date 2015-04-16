[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

# Notice!

This feature will soon be deprecated in favor of the [responsive layout module](#/component/layout). This new module implements a more intuitive, semantic, attribute-based syntax for creating responsive designs making use of flexbox.

# Description

While EncoreUI was initially designed to be an AngularJS widget library, we recognize that teams will want to use a CSS layout framework. We have added the [Grids module from Yahoo!'s Pure CSS framework](http://purecss.io/grids/) for teams to easily build out a grid or column system as part of EncoreUI. We chose this lightweight framework for its emphasis on flex based layouts.

# Usage

No additional installation is required. We have automatically included `grids-min.css` into the encore-ui CSS libraries.

Note that most of the grid layouts you will use will be in the context of `rxPage` inside `rxApp`. For this reason we will be using the regular grids only, and not responsive grids.

The code sample below will probably give the clearest context of how grids work. Note that the `.pure-g` also has a `clear` class attached because title containers on `rxPage` components are defaulted to float left.

You'll find that the grid components will not have borders or padding within the grid units themselves. If you need white space between grid columns, adding a `columns` class to the `.pure-g` container will give padding of 1.5ems per each individual cell, or 3ems together.
