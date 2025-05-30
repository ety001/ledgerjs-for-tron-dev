describe('signPersonalMessage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
    cy.get('div[role="tablist"]>button[role="tab"]:nth-child(1)').click();
    cy.get('button[data-slot="button"]').contains('Start').click();
    cy.wait(5000);
    cy.get('div[data-slot="card-description"]>span[data-slot="badge"]').should('have.html', 'Running');
  });
  it('signPersonalMessage', () => {
    // pop up menu
    cy.get('button[data-slot="popover-trigger"][role="combobox"][data-state="closed"]').click();
    // select signPersonalMessage
    cy.get('div[data-slot="command-item"][data-value="signPersonalMessage"]').click();
    // input message
    cy.get('textarea[data-slot="form-control"][name="message"]').type('test');
    // click submit
    cy.get('button[data-slot="button"][type="submit"]').contains('Submit').click();
    // check screen 1:
    cy.get('#eventlog')
      .should('have.value', 
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"Message","x":41,"y":17,"w":128,"h":32}\n'
      );
    // click button: Right
    cy.get('button[data-slot="button"]').contains('Right ').click();
    cy.wait(1000);
    // check screen 2:
    cy.get('#eventlog')
      .should('have.value', 
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"Message","x":41,"y":17,"w":128,"h":32}\n' +
        '{"text":"Message hash","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"5BEE...D189","x":34,"y":17,"w":88,"h":32}\n'
      );
    // click button: Right
    cy.get('button[data-slot="button"]').contains('Right ').click();
    cy.wait(1000);
    // check screen 3:
    cy.get('#eventlog')
      .should('have.value', 
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"Message","x":41,"y":17,"w":128,"h":32}\n' +
        '{"text":"Message hash","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"5BEE...D189","x":34,"y":17,"w":88,"h":32}\n' +
        '{"text":"Sign with (1/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"TUEZSdKsoDHQMeZ","x":11,"y":17,"w":111,"h":32}\n'
      );
    // click button: Right
    cy.get('button[data-slot="button"]').contains('Right ').click();
    cy.wait(1000);
    // check screen 4:
    cy.get('#eventlog')
      .should('have.value', 
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"Message","x":41,"y":17,"w":128,"h":32}\n' +
        '{"text":"Message hash","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"5BEE...D189","x":34,"y":17,"w":88,"h":32}\n' +
        '{"text":"Sign with (1/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"TUEZSdKsoDHQMeZ","x":11,"y":17,"w":111,"h":32}\n' +
        '{"text":"Sign with (2/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"wihtdoBiN46zxhGWY","x":9,"y":17,"w":113,"h":32}\n'
      );
    // click button: Right
    cy.get('button[data-slot="button"]').contains('Right ').click();
    cy.wait(1000);
    // check screen 5:
    cy.get('#eventlog')
      .should('have.value', 
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"Message","x":41,"y":17,"w":128,"h":32}\n' +
        '{"text":"Message hash","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"5BEE...D189","x":34,"y":17,"w":88,"h":32}\n' +
        '{"text":"Sign with (1/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"TUEZSdKsoDHQMeZ","x":11,"y":17,"w":111,"h":32}\n' +
        '{"text":"Sign with (2/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"wihtdoBiN46zxhGWY","x":9,"y":17,"w":113,"h":32}\n' +
        '{"text":"Sign with (3/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"dH","x":57,"y":17,"w":65,"h":32}\n'
      );
    // click button: Right
    cy.get('button[data-slot="button"]').contains('Right ').click();
    cy.wait(1000);
    // check screen 6:
    cy.get('#eventlog')
      .should('have.value', 
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"Message","x":41,"y":17,"w":128,"h":32}\n' +
        '{"text":"Message hash","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"5BEE...D189","x":34,"y":17,"w":88,"h":32}\n' +
        '{"text":"Sign with (1/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"TUEZSdKsoDHQMeZ","x":11,"y":17,"w":111,"h":32}\n' +
        '{"text":"Sign with (2/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"wihtdoBiN46zxhGWY","x":9,"y":17,"w":113,"h":32}\n' +
        '{"text":"Sign with (3/3)","x":28,"y":3,"w":94,"h":32}\n' +
        '{"text":"dH","x":57,"y":17,"w":65,"h":32}\n' +
        '{"text":"Sign","x":41,"y":3,"w":128,"h":32}\n' +
        '{"text":"message","x":41,"y":17,"w":128,"h":32}\n'
      );
    // click button: Both
    cy.get('button[data-slot="button"]').contains(' Both').click();
    cy.wait(1000);

    // check result
    cy.get('.text-muted-foreground > .border-input')
      .should('have.value',
        '06ecd4ca31131b28fe83211ee3e8567d2334390ccb18544c6b510dba95af78bb779e54dc721e90d4b52eb5cde7cf7b3045f0e6412f16840e52da80721409bc3201'
      );
  });
})