
/* rules */


flow.rule("Calculate", [
         //Type     alias  pattern           store sequence to s1
        [Fibonacci, "f1",  "f1.value != -1", {sequence:"s1"}],
        [Fibonacci, "f2", "f2.value != -1 && f2.sequence == s1 + 1", {sequence:"s2"}],
        [Fibonacci, "f3", "f3.value == -1 && f3.sequence == s2 + 1"],
        [Result, "r"]
    ], function (facts) {
        var f3 = facts.f3, f1 = facts.f1, f2 = facts.f2;
        var v = f3.value = f1.value + facts.f2.value;
        facts.r.result = v;
        this.modify(f3);
        this.retract(f1);
    });
