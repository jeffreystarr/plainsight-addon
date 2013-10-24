Hide in Plain Sight
===================
*A Mozilla Firefox for Steganographic Encryption*

What does it do?
================

Using this add-on, you can select some text (for example, text in an email you were editing in your browser) and transform it to English-like text. If your recipient has the same key as you, they can transform it back to your original text.

As the algorithm improves, a third party ("bad guy") should be unsuspecting that there is an underlying secret message encoded in the cover text.

How does it work?
=================

This release of the software uses a Reverse Huffman steganographic algorithm. The algorithm is discussed in Peter Wayner's book *Disappearing Crytography*.

How do I use it?
================

There are two steps to use this software:

1. Generate a key for each party that you wish to communicate with
2. Sender hides, recipient unhides
