build({
  output: builddir("something.o"),
  inputs: [rel("something.c")],
  rule: "cc",
});

build({
  output: builddir("something_else.o"),
  inputs: [rel("something_else.c")],
  rule: "cc",
});

build({
  output: builddir("myprog.o"),
  inputs: [rel("myprog.c")],
  rule: "cc",
});

build({
  output: builddir("myprog"),
  inputs: [builddir("something.o"), builddir("myprog.o")],
  rule: "link",
});

build({
  output: builddir("somethings.a"),
  inputs: [builddir("something.o"), builddir("something_else.o")],
  rule: "ar",
});

build({
  output: builddir("hi.txt"),
  inputs: [rel("something.txt")],
  rule: "something_with_args",
  ruleVariables: {
    message: "hi",
  },
});
