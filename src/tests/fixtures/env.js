declare("cc", "gcc");
declare("ar", "gcc-ar");
declare("cflags", "-Wall");
declare("ldflags", "");
declare("libs", "-lm");

declareOrAppend("libs", "-lpthread");
declareOrAppend("cflags", "-g");

declare("dotexe", ".exe");

overrideDeclaration("dotexe", "");
