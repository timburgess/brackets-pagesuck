PageSuck - An Extension for Adobe Brackets (EdgeCode)
=====================================================

PageSuck is an extension to Adobe Brackets that allows you to pull the contents of
of any URL directly into your editor. See a webpage where you wonder 'how did they do that?'
Have a page on a remote production server that you would like to tweak and experiment with?

With PageSuck installed, simply Alt-S, type in the full URL and PageSuck will suck the
the contents of that page directly into a new editor file for you.

Raymond Camden blogged (and did a demo screencast) about PageSuck on the [Adobe Brackets blog](http://blog.brackets.io/2013/02/11/pagesuck-brackets-extension/#more-402).

To install
==========

To install this extension, in Brackets choose Help->Show Extensions Folder. In the user directory,
create a directory called ```PageSuck``` and simply place the contents of this repository into
that folder. Then restart Brackets.

Alternatively, if you are using Brackets from the source code, create a ```PageSuck``` folder
inside the ```brackets/src/extensions/user``` folder, and reload Brackets.

**Compatible with Brackets Sprint 28 or later**

Licence
=======
PageSuck is licenced under the [MIT licence](http://en.wikipedia.org/wiki/MIT_licence).

History
=======
2013-08-01: Resolved 'Grey Screen of Death' caused by underlying Bootstrap changes in Brackets.
            Dialog buttons now in user's language.
            Now uses Alt-S to avoid conflict with newer Brackets commands.

2012-12-28: Initial release

See TODO for slated improvements
